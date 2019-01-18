import { getUsers } from "./users";

describe("test get users function", () => {
  it("should return all users", () => {
    expect(getUsers());
  });
});
