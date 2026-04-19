# Firebase Security Test Specification

## 1. Data Invariants
- A `user` profile must belong to the user (`request.auth.uid == userId`).
- A `post` must strictly have valid coordinates and its `authorId` must match the current user ID. Only non-mutable fields (`likesCount`, etc.) can be updated by others or using specific actions.
- A `comment` belongs to a post and cannot be updated by anyone other than the author, except for strictly updating `upvotes`.
- A `booking` must be created inside `/users/{userId}/bookings/{bookingId}` strictly for `request.auth.uid == userId`.

## 2. The "Dirty Dozen" Payloads

1. **Spoofed User Registration**: Attempt to create a user profile for a different UID.
2. **Missing Verified Email**: Attempt to create anything while `email_verified == false`.
3. **Invalid Post Coordinates**: Create a post with `lat` as a string instead of number.
4. **Post ID Poisoning**: Create a post using an ID string exceeding 128 chars.
5. **Role Escalation**: Update one's own `role` or `firePoints` to an inflated amount.
6. **Orphaned Comment**: Create a comment for a `postId` that does not exist.
7. **Cross-User Booking Access**: Attempt to read/write a booking in another user's path.
8. **Comment Deletion**: Attempt to delete another user's comment.
9. **Status Manipulation**: Try to mutate a booking that is "cancelled" back to "upcoming".
10. **Array Poisoning**: Pass an array into a restricted field like `placeName`.
11. **Excessive Upvote Inflation**: Update `upvotes` not using an increment/decrement exactly by 1 (Wait, we'll just restrict upvotes action).
12. **PII Leak**: Read private `user` records of another user without admin access.

## 3. Test Runner
We will generate `firestore.rules.test.ts` to enforce these.
