
ALTER TABLE "product" ADD CONSTRAINT "product_quantity_check" CHECK ("quantity" >= 0);