# Testing the Clerk Webhook Implementation

This directory contains several endpoints for testing the Clerk webhook implementation without needing to set up a real Clerk webhook.

## Testing Endpoints

### 1. Direct User Creation

`POST /api/webhook/test/direct-create`

Creates a test user directly in your database using the same API route that the Clerk webhook would use.

Example request body:

```json
{
  "clerkId": "user_test_12345",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "imageUrl": "https://example.com/avatar.jpg"
}
```

If you don't provide values, default test values will be used with a unique identifier to avoid conflicts.

### 2. Direct User Update

`POST /api/webhook/test/direct-update`

Updates an existing test user in your database using the same API route that the Clerk webhook would use.

Example request body:

```json
{
  "clerkId": "user_test_12345", // Required
  "firstName": "Updated",
  "lastName": "User",
  "imageUrl": "https://example.com/new-avatar.jpg"
}
```

You only need to include the fields you want to update.

### 3. List Test Users

`GET /api/webhook/test/list-test-users`

Lists all test users in your database (users with clerkId starting with "test\_" or "user_test").

### 4. Cleanup Test Users

`POST /api/webhook/test/cleanup`

Removes test users from your database.

Example request body to delete a specific user:

```json
{
  "clerkId": "user_test_12345"
}
```

Example request body to delete all test users:

```json
{
  "all": true
}
```

## Testing Workflow

1. **Create a test user** - Use the direct-create endpoint to create a test user
2. **Verify the user was created** - Use the list-test-users endpoint to confirm the user exists
3. **Update the user** - Use the direct-update endpoint to modify the user
4. **Verify the updates** - Use the list-test-users endpoint again to confirm the changes
5. **Clean up** - Use the cleanup endpoint to remove test users when done

## Security Note

All endpoints require authentication through Clerk. You must be logged in to use these endpoints.

## Troubleshooting

If you encounter issues:

1. Check that `NEXT_PUBLIC_SERVER_URL` is set correctly in your environment variables
2. Ensure your database connection is working properly
3. Check the response status and error messages for more details
