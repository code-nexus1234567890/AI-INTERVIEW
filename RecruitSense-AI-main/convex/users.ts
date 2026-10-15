import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .collect();

    if (users?.length === 0) {
      const data = {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      };
      const result = await ctx.db.insert("users", data);
      return {
        ...data,
        _id: result,
      };
    }
    return users[0];
  },
});