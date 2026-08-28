# Convención de commits

## Formato

```
Tipo|IdTarea|YYYYMMDD|Descripción en inglés imperativo
```

Cuatro campos separados por `|`, **sin espacios alrededor de las barras**.

| Campo | Regla | Ejemplo |
|---|---|---|
| `Tipo` | Uno de la tabla de abajo. Primera letra mayúscula. | `Feature` |
| `IdTarea` | Identificador de la tarea. Sin espacios. | `SMD-142` |
| `YYYYMMDD` | Fecha del commit, 8 dígitos, sin separadores. | `20260827` |
| `Descripción` | Inglés, **modo imperativo**, **máximo 60 caracteres**, sin punto final. | `Add shelf location to publish contract` |

El límite de 60 caracteres aplica **solo a la descripción**, no a la línea completa.

## Tipos admitidos

| Tipo | Cuándo |
|---|---|
| `Feature` | Funcionalidad nueva visible para el usuario |
| `Fix` | Corrección de un defecto |
| `Hotfix` | Corrección urgente aplicada directamente sobre producción |
| `Refactor` | Cambio interno sin alterar el comportamiento observable |
| `Docs` | Solo documentación |
| `Test` | Solo pruebas |
| `Perf` | Mejora de rendimiento |
| `Build` | Dependencias, empaquetado, migraciones de base de datos |
| `CI` | Pipelines y automatización |
| `Chore` | Mantenimiento que no encaja en lo anterior |

## Modo imperativo

La descripción completa la frase *"This commit will…"*. Se escribe como una **orden**, no
como un relato de lo hecho.

| Correcto | Incorrecto | Motivo |
|---|---|---|
| `Add publish contract validation` | `Added publish contract validation` | Pasado |
| `Fix ISBN checksum on ISBN-10` | `Fixes ISBN checksum on ISBN-10` | Tercera persona |
| `Move field rules from DTO to domain` | `Moving field rules to domain` | Gerundio |
| `Remove logo placeholder` | `Removal of logo placeholder` | Sustantivo |

## Ejemplos reales de este proyecto

```
Feature|SMD-101|20260827|Add book lifecycle draft to published
Feature|SMD-104|20260827|Add shelf location as publish requirement
Fix|SMD-118|20260827|Return 200 instead of 201 on publish endpoint
Fix|SMD-119|20260827|Load logo from assets path in home banner
Refactor|SMD-121|20260827|Move field rules from DTOs to domain layer
Build|SMD-097|20260827|Add es_unaccent text search configuration
Docs|SMD-130|20260827|Document data dictionary gaps against mockup
Test|SMD-112|20260827|Cover ISBN checksum and publish contract
```

## Validación automática

El hook `commit-msg` rechaza cualquier mensaje que no cumpla el formato. Instálalo una vez
por clon:

```bash
npm run hooks:install
```

Comprueba: número de campos, tipo admitido, fecha con forma `YYYYMMDD`, longitud de la
descripción, ausencia de punto final, y avisa si detecta pasado o gerundio en inglés.

Para saltártelo de forma deliberada: `git commit --no-verify`. Debería ser excepcional.

## Reglas adicionales

- **Sin atribución de IA.** Nada de `Co-Authored-By` ni firmas generadas.
- **Un commit, un cambio.** Si necesitas la palabra "y" en la descripción, probablemente
  son dos commits.
- La descripción va en **inglés**; la documentación del repositorio, en **español**. Es
  deliberado: el historial es código, y la convención del ecosistema es el inglés.
