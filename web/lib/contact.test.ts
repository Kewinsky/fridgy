import assert from "node:assert/strict";
import test from "node:test";
import { CONTACT_LIMITS, contactMessageSchema } from "./contact.ts";

const message = {
  name: "  Anna  ",
  email: " anna@example.com ",
  subject: " Pytanie o przepisy ",
  message: "  Jak mogę dodać własny przepis?  ",
};

test("contact messages trim fields and retain the user's message", () => {
  assert.deepEqual(contactMessageSchema.parse(message), {
    name: "Anna",
    email: "anna@example.com",
    subject: "Pytanie o przepisy",
    message: "Jak mogę dodać własny przepis?",
  });
});

test("contact messages reject blank fields, invalid email and short or oversized messages", () => {
  for (const field of ["name", "email", "subject", "message"])
    assert.equal(
      contactMessageSchema.safeParse({ ...message, [field]: "   " }).success,
      false,
      field,
    );
  assert.equal(
    contactMessageSchema.safeParse({ ...message, email: "not-an-email" })
      .success,
    false,
  );
  assert.equal(
    contactMessageSchema.safeParse({ ...message, message: "Hi" }).success,
    false,
  );
  assert.equal(
    contactMessageSchema.safeParse({
      ...message,
      message: "x".repeat(CONTACT_LIMITS.message + 1),
    }).success,
    false,
  );
});
