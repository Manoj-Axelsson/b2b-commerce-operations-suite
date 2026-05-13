import prisma from "../lib/prisma";
import { createOrderFromCart } from "../modules/checkout/checkout.services";

async function setupUser(email: string, name: string) {
    let user = await prisma.user.findUnique({ where: { email }, include: { cart: true, addresses: true } });
    if (!user) {
        user = await prisma.user.create({
            data: { id: "test-" + email, email, name, role: "user" },
            include: { cart: true, addresses: true }
        });
    }
    if (!user.cart) {
        await prisma.cart.create({ data: { userId: user.id } });
        const updatedUser = await prisma.user.findUnique({ where: { email }, include: { cart: true, addresses: true } });
        if (!updatedUser) throw new Error("User lost during setup");
        user = updatedUser;
    }
    if (user!.addresses.length === 0) {
        await prisma.address.create({
            data: {
                userId: user!.id,
                firstName: name,
                lastName: "Tester",
                street: "Test street 1",
                houseNumber: "1",
                city: "Stockholm",
                postalCode: "12345",
                country: "Sweden"
            }
        });
        const updatedUser = await prisma.user.findUnique({ where: { email }, include: { cart: true, addresses: true } });
        if (!updatedUser) throw new Error("User lost during setup");
        user = updatedUser;
    }
    return user!;
}

async function runDeadlockTest() {
  console.log("--- Starting Aggressive Deadlock Collision Test ---");

  // 1. Get two products
  const products = await prisma.product.findMany({
    where: { quantity: { gt: 10 } },
    take: 2,
  });

  if (products.length < 2) {
    console.error("Not enough products. Need products with > 500 qty.");
    process.exit(1);
  }

  const [p1, p2] = products;
  console.log(`Product A: ${p1.name}`);
  console.log(`Product B: ${p2.name}`);

  // 2. Setup two users
  const userA = await setupUser("tester_a@rajput.com", "Tester A");
  const userB = await setupUser("tester_b@rajput.com", "Tester B");

  // 3. Clear and Populate Carts with different orders
  await prisma.cartItem.deleteMany({ where: { cartId: { in: [userA.cart!.id, userB.cart!.id] } } });

  // User A: P1 then P2 (natural order if they are returned by DB like this)
  await prisma.cartItem.createMany({
    data: [
        { cartId: userA.cart!.id, productId: p1.id, quantity: 1 },
        { cartId: userA.cart!.id, productId: p2.id, quantity: 1 },
    ]
  });

  // User B: P2 then P1
  await prisma.cartItem.createMany({
    data: [
        { cartId: userB.cart!.id, productId: p2.id, quantity: 1 },
        { cartId: userB.cart!.id, productId: p1.id, quantity: 1 },
    ]
  });

  console.log("\nLaunching colliding checkouts...");

  // We fire them at the same time.
  const results = await Promise.allSettled([
    createOrderFromCart({ userId: userA.id, addressId: userA.addresses[0].id, idempotencyKey: "deadlock-a-" + Date.now() }),
    createOrderFromCart({ userId: userB.id, addressId: userB.addresses[0].id, idempotencyKey: "deadlock-b-" + Date.now() }),
  ]);

  let deadlockFound = false;
  results.forEach((res, i) => {
    const name = i === 0 ? "User A" : "User B";
    if (res.status === "fulfilled") {
      console.log(`${name} Success: Order ${res.value.id}`);
    } else {
      console.error(`${name} Failed:`, res.reason.message || res.reason);
      if (res.reason.code === 'P2033' || (res.reason.message && res.reason.message.includes('deadlock'))) {
        deadlockFound = true;
      }
    }
  });

  if (deadlockFound) {
    console.log("\n[!!!] DEADLOCK DETECTED! System is vulnerable.");
  } else {
    console.log("\n[?] No deadlock this time. Race conditions are probabilistic. Try running again.");
  }

  process.exit(0);
}

runDeadlockTest().catch(err => {
  console.error("Crash:", err);
  process.exit(1);
});
