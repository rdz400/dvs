/**
 * Toon actieve projecten met wat metadata
 */

const projectenFolder = '"1-someday"';
let pages = dv.pages(`${projectenFolder}`).filter(p => p.type === 'someday')

const data2 = pages.map(el =>
        ({
            area: extractArea(el),
            name: `[[${el.file.name}]]`,
            start: el.start,
            areas: extractAreas(el),
            daily: laatsteDaily(el)[0],
            dagen: laatsteDaily(el)[1],
            is_parked: isParked(el),
        }));

const dvData = dv.array(data2).sort(el => [el.is_parked, el.area]);

dv.table(
    ['area', 'naam', 'start', 'areas', 'last', 'sinds', 'is_parked'],
    dvData.map(el => [el.area, el.name, el.start, el.areas, el.daily, el.dagen, el.is_parked])
    );

function isParked(p){
    return p.file.folder.includes('0-parked')
}

function laatsteDaily(p) {
    let dailyInlinks = p
        .file
        .inlinks
        .filter(l => l.path.startsWith('0-daily'))
        .map(l => dv.page(l))
        .date
    const maxDate = dv.date(dailyInlinks.map(el=>el.toISODate()).sort(null, 'desc')[0]);
    const lastDateISO = maxDate?.toFormat("yyyyLLdd");
    const aantalDagenSinds = maxDate?.diff(dv.date("today"), "days").days;
    return [lastDateISO, aantalDagenSinds];
}


function extractAreas(p) {
    const areas = p.areas?.map(el => dv.page(el.path).file.name).join(', ');
    return areas;
}

function extractArea(p) {
    const area = p.areas?.map(el => dv.page(el.path).file.name)[0];
    return area;
}