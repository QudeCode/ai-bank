---
type: llm
focus: trace
---

PASS si se crea una decisión 0002 sobre usar webhooks que indica que sustituye a la 0001, la 0001 conserva su contexto y su decisión originales y solo cambia su estado a «sustituida por 0002» (o equivalente con enlace), y el índice README.md refleja ambas con su estado.

FAIL si se reescribe el contenido de la 0001 para describir los webhooks, si se borra la 0001, si no se actualiza el índice, o si la 0002 no menciona que sustituye a la 0001.
