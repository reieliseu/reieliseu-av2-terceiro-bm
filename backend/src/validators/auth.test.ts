import assert from "node:assert/strict"
import test from "node:test"
import { loginSchema, registerSchema } from "./auth"

test("registro normaliza nome e e-mail", () => {
  const result = registerSchema.safeParse({
    name: "  Ana Silva  ",
    email: "  ANA@EXEMPLO.COM  ",
    password: "senha-segura-123",
  })

  assert.ok(result.success)
  assert.equal(result.data.name, "Ana Silva")
  assert.equal(result.data.email, "ana@exemplo.com")
  assert.equal(result.data.password, "senha-segura-123")
})

test("registro rejeita e-mail inválido e senha curta", () => {
  const result = registerSchema.safeParse({ name: "Ana", email: "invalido", password: "123" })

  assert.equal(result.success, false)
})

test("login normaliza e-mail e rejeita senha vazia", () => {
  const valid = loginSchema.safeParse({ email: " ANA@EXEMPLO.COM ", password: "senha-segura" })
  const invalid = loginSchema.safeParse({ email: "ana@exemplo.com", password: "" })

  assert.ok(valid.success)
  assert.equal(valid.data.email, "ana@exemplo.com")
  assert.equal(invalid.success, false)
})
