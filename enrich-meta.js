/**
 * Doorzoek regels op tags en links. Verrijk regels met metadata aanwezig
 * in parents.
 * 
 * @param { } input.tags - Tags om te zoeken in regels
 * @param { } input.link - Naam van bestand waarvoor backlinks te vinden
 */


/////////////
// Functies voor weergave 
/////////////

function display(list){
    
    let grouped = list
        .groupBy(el => el.path)
        .sort((k => dv.page(k.key).file.name), 'desc');

    for (let group of grouped){
        dv.header(2, dv.fileLink(group.key));

        const baseLevel = group.rows[0].level; // Normalize to first item's depth
        const mdlist = group.rows
        .map(({ level, text }) => {
          const adjustedLevel = Math.max(0, level - baseLevel); // Prevent negative indent
          return `${" ".repeat(adjustedLevel * 4)}- ${text}`;
        })
        .join("\n");
        dv.paragraph(mdlist);
    }
}

function showItemsLinksTags(list){
    const listsFiltered = list.limit(100);
    dv.table(
        ['parent', 'text', 'tags', 'links', 'path', 'level', 'root'],
        listsFiltered.map(i => [i.parent, i.text, [...i.setTags], [...i.setOutlinks], i.path, i.level, i.root])
    )
}

function showItems(list){
    const listsFiltered = list.limit(100);
    dv.table(
        ['parent', 'line', 'text', 'path', 'level', 'root', 'setTags'],
        listsFiltered.map(i => [i.parent, i.line, i.text, i.path, i.level, i.root, i.setTags])
    )
}

/////////////
// Logica metadata
/////////////

function assignLevels(item, level = null){
    // recursief toekennen van niveau's aan items

    // return vroegtijdig indien level al is toegekend
    if (item.level !== undefined) return;

    const effectiveLevel = (level === null) ? 0 : level;
    item.level = effectiveLevel;

    // ken niveau's aan kinderen toe
    for (const child of item.children) assignLevels(child, effectiveLevel + 1);
}

function assignRoot(item, root = null){
    // recursief toekennen van root line aan children
    // dit werkt enkel als items op volgorde verwerkt worden

    // Negeer root items die een parent hebben
    if (item.parent !== undefined && root === null) return;

    // Negeer items waarvan al een root is toegekend
    if (item.root !== undefined) return;

    // eerste iteratie recursie
    if (root === null) {
        root = item.line;
    }
    item.root = root;

    // recursief toekennen root aan children
    for (const child of item.children){
        assignRoot(child, root);
    }
}

function enrichItem(item){
    // Maak 2 sets voor tags en links en assign aan item
    const setTags = new Set(item.tags);
    const setOutPaths = new Set(item.outlinks.map(l => l.path));
    item.setTags = setTags;
    item.setOutlinks = setOutPaths; 
}

function enrichDescendentsWrapper(){
    const processed = new Set();
    function enrichDescendents(item){
        // Recursief verrijken van child items met tags en links van parent
        const myTags = item.setTags;
        const myOutlinks = item.setOutlinks;
    
        for (const child of item.children){
            if (processed.has(child)){
                continue
            }
            child.setTags = child.setTags.union(myTags)
            child.setOutlinks = child.setOutlinks.union(myOutlinks)
            processed.add(child)
            enrichDescendents(child)
        }
    }
    return enrichDescendents
}

/////////////
// Verwerkingspijplijn voor regels 
/////////////

function main(){
    // Voeg een set toe aan ieder item
    // lists.forEach(enrichItems);
    for (const item of lists) enrichItem(item);

    // verrijk de kinderen met tags, links en level
    lists.forEach(enrichDescendentsWrapper());

    // voeg niveau's en root parent toe aan items
    for (const item of lists) assignLevels(item);
    for (const item of lists) assignRoot(item);

    // nu filteren we op de regels die we willen behouden
    if (input.link !== null){
        lists = lists.filter(i => (i.setOutlinks.has(input.link)))
    }

    if (setTags.size !== 0){
        lists = lists.filter(i => (i.setTags.intersection(setTags).size > 0))
    }

    // tijd om dingen weer te geven
    display(lists);
}    

/////////////
// Parameters ophalen
/////////////

input.tags = input.tags ? input.tags: [] // garandeer een array

// start de pipeline
const fileUrl = `[[${input.link}]]`
const tagsAsText = input.tags.map(t => `#${t}`)
const setTags = new Set(tagsAsText);

// Query
const tagsAsQuery = tagsAsText.join(' or ')
let query;
if (input.link === null){
    query = tagsAsQuery;
} else if (input.tags.length === 0) {
    query = `${fileUrl}`
} else {
    query = `${fileUrl} and (${tagsAsQuery})`
}

// Alle pagina's die matchen met source
const pages = dv.pages(query).filter(p => (p.type !== 'dataview')).sort(p => p.file.cday, 'desc');

// Alle regels horend bij bovenstaande
let lists = pages.file.lists;

main()
