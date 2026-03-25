import React from "react";
import { User } from "../types";

interface UserListProps {
  users: User[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="border p-2 rounded shadow-sm">
            <span className="font-semibold">{user.name}</span> ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};
