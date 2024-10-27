---
date: 2024-10-26
type: dataview
cssclasses:
  - rotest
link:
tags:
---

## Omschrijving
Deze notitie kan ik gebruiken om dataview scripts te testen. Vervang in het onderstaande code block de verwijzing naar de naam van het script. Vervolgens zal het corresponderende script uitgevoerd worden.

```javascript
await dv.view('<script-naam>'); // Vervang met <script-naam>
```

## Output DataView begint hier
---

```dataviewjs

// huidige pagina
const current = dv.current();

// de filters
const getFileName = path => path.split('/').pop().split('.').shift();
const link = current.link;
const tags = current.tags;

if (link === null && tags.length === 0){
    throw new Error("Both link and tags cannot be empty")
}

const linkName = link ? getFileName(link.path): null;

console.log(linkName);

await dv.view('enrich-meta', {'link': linkName, 'tags': tags});
```