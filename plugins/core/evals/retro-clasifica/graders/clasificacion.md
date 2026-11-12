---
type: llm
---

PASS si la respuesta clasifica:
- el guard AdminOnly como conocimiento específico del proyecto (para su contexto o CLAUDE.md, no para el banco);
- TEST_DATABASE_URL como específico del proyecto (CLAUDE.md o contexto del verificador);
- los hallazgos de estilo de dev:revisor-codigo en modo correccion como candidato generalizable al banco, redactado sin nombres del proyecto;
- la hora de terminar como ruido o descartado;

y además pide confirmación antes de aplicar cambios o abrir un issue.

FAIL si propone llevar al banco el guard AdminOnly o TEST_DATABASE_URL, si incluye nombres o detalles del proyecto en el candidato al banco, o si da por creado un issue sin preguntar.
