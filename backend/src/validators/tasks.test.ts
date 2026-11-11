import assert from "node:assert/strict"
import test from "node:test"
import { createTaskSchema, updateTaskSchema } from "./tasks"

test("criação aplica situação e prioridade padrão", () => {
  const result = createTaskSchema.safeParse({ title: "  Revisar álgebra  ", subject: "  Matemática  " })

  assert.ok(result.success)
  assert.equal(result.data.title, "Revisar álgebra")
  assert.equal(result.data.subject, "Matemática")
  assert.equal(result.data.status, "PENDING")
  assert.equal(result.data.priority, "MEDIUM")
})

test("criação rejeita situação fora do domínio e título vazio", () => {
  const invalidStatus = createTaskSchema.safeParse({ title: "Tarefa", subject: "História", status: "DONE" })
  const emptyTitle = createTaskSchema.safeParse({ title: "   ", subject: "História" })

  assert.equal(invalidStatus.success, false)
  assert.equal(emptyTitle.success, false)
})

test("atualização aceita campos parciais e rejeita objeto vazio", () => {
  const valid = updateTaskSchema.safeParse({ status: "COMPLETED" })
  const empty = updateTaskSchema.safeParse({})

  assert.ok(valid.success)
  assert.equal(valid.data.status, "COMPLETED")
  assert.equal(empty.success, false)
})

test("vínculo de subtarefa exige identificador UUID", () => {
  const result = createTaskSchema.safeParse({ title: "Tarefa", subject: "História", parentId: "nao-e-uuid" })

  assert.equal(result.success, false)
})
