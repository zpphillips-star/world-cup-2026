import type { DataProvider, Match, Team, Venue, Group, Standing, BracketRound, BracketSlot, TeamStats } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// VENUES — All 16 official FIFA World Cup 2026 venues
// ─────────────────────────────────────────────────────────────────────────────
const venues: Record<string, Venue> = {
  azteca:       { id: "azteca",       name: "Estadio Banorte",        city: "Mexico City",     country: "Mexico", timezone: "America/Mexico_City" },
  akron:        { id: "akron",        name: "Estadio Akron",          city: "Guadalajara",     country: "Mexico", timezone: "America/Mexico_City" },
  bbva:         { id: "bbva",         name: "Estadio BBVA",           city: "Guadalupe",       country: "Mexico", timezone: "America/Monterrey" },
  metlife:      { id: "metlife",      name: "MetLife Stadium",        city: "East Rutherford", country: "USA",    timezone: "America/New_York" },
  mercedesbenz: { id: "mercedesbenz", name: "Mercedes-Benz Stadium",  city: "Atlanta",         country: "USA",    timezone: "America/New_York" },
  hardrock:     { id: "hardrock",     name: "Hard Rock Stadium",      city: "Miami",           country: "USA",    timezone: "America/New_York" },
  gillette:     { id: "gillette",     name: "Gillette Stadium",       city: "Foxborough",      country: "USA",    timezone: "America/New_York" },
  lincoln:      { id: "lincoln",      name: "Lincoln Financial Field", city: "Philadelphia",   country: "USA",    timezone: "America/New_York" },
  att:          { id: "att",          name: "AT&T Stadium",           city: "Arlington",       country: "USA",    timezone: "America/Chicago" },
  arrowhead:    { id: "arrowhead",    name: "GEHA Field at Arrowhead", city: "Kansas City",     country: "USA",    timezone: "America/Chicago" },
  nrg:          { id: "nrg",          name: "NRG Stadium",            city: "Houston",         country: "USA",    timezone: "America/Chicago" },
  sofi:         { id: "sofi",         name: "SoFi Stadium",           city: "Inglewood",       country: "USA",    timezone: "America/Los_Angeles" },
  levis:        { id: "levis",        name: "Levi's Stadium",         city: "Santa Clara",     country: "USA",    timezone: "America/Los_Angeles" },
  lumen:        { id: "lumen",        name: "Lumen Field",            city: "Seattle",         country: "USA",    timezone: "America/Los_Angeles" },
  bcplace:      { id: "bcplace",      name: "BC Place",               city: "Vancouver",       country: "Canada", timezone: "America/Vancouver" },
  bmo:          { id: "bmo",          name: "BMO Field",              city: "Toronto",         country: "Canada", timezone: "America/Toronto" },
  // Placeholder for unconfirmed venue assignments
  tbd:          { id: "tbd",          name: "TBD",                    city: "TBD",             country: "TBD",    timezone: "UTC" },
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAMS — All 48 qualified teams with verified group assignments
// Draw: December 5, 2025 — Kennedy Center, Washington D.C.
// Source: Wikipedia (Groups A–L individual pages)
// ─────────────────────────────────────────────────────────────────────────────
const teams: Record<string, Team> = {
  // GROUP A — Opens Jun 11
  mexico:       { id: "mexico",       name: "Mexico",                flag: "🇲🇽", group: "A" },
  southkorea:   { id: "southkorea",   name: "South Korea",           flag: "🇰🇷", group: "A" },
  southafrica:  { id: "southafrica",  name: "South Africa",          flag: "🇿🇦", group: "A" },
  czechrepublic:{ id: "czechrepublic",name: "Czech Republic",        flag: "🇨🇿", group: "A" },

  // GROUP B — Opens Jun 12
  canada:       { id: "canada",       name: "Canada",                flag: "🇨🇦", group: "B" },
  switzerland:  { id: "switzerland",  name: "Switzerland",           flag: "🇨🇭", group: "B" },
  qatar:        { id: "qatar",        name: "Qatar",                 flag: "🇶🇦", group: "B" },
  bosnia:       { id: "bosnia",       name: "Bosnia & Herzegovina",  flag: "🇧🇦", group: "B" },

  // GROUP C — Opens Jun 13
  brazil:       { id: "brazil",       name: "Brazil",                flag: "🇧🇷", group: "C" },
  morocco:      { id: "morocco",      name: "Morocco",               flag: "🇲🇦", group: "C" },
  scotland:     { id: "scotland",     name: "Scotland",              flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },
  haiti:        { id: "haiti",        name: "Haiti",                 flag: "��🇹", group: "C" },

  // GROUP D — Opens Jun 12
  usa:          { id: "usa",          name: "United States",         flag: "🇺��", group: "D" },
  australia:    { id: "australia",    name: "Australia",             flag: "🇦🇺", group: "D" },
  paraguay:     { id: "paraguay",     name: "Paraguay",              flag: "🇵🇾", group: "D" },
  turkey:       { id: "turkey",       name: "Turkey",                flag: "🇹🇷", group: "D" },

  // GROUP E — Opens Jun 14
  germany:      { id: "germany",      name: "Germany",               flag: "🇩🇪", group: "E" },
  ecuador:      { id: "ecuador",      name: "Ecuador",               flag: "��🇨", group: "E" },
  ivorycoast:   { id: "ivorycoast",   name: "Ivory Coast",           flag: "🇨🇮", group: "E" },
  curacao:      { id: "curacao",      name: "Curaçao",               flag: "🇨🇼", group: "E" },

  // GROUP F — Opens Jun 14
  netherlands:  { id: "netherlands",  name: "Netherlands",           flag: "🇳🇱", group: "F" },
  japan:        { id: "japan",        name: "Japan",                 flag: "🇯🇵", group: "F" },
  tunisia:      { id: "tunisia",      name: "Tunisia",               flag: "🇹🇳", group: "F" },
  sweden:       { id: "sweden",       name: "Sweden",                flag: "🇸🇪", group: "F" },

  // GROUP G — Opens Jun 15 (all West Coast USA/Canada venues)
  belgium:      { id: "belgium",      name: "Belgium",               flag: "🇧🇪", group: "G" },
  iran:         { id: "iran",         name: "Iran",                  flag: "🇮🇷", group: "G" },
  egypt:        { id: "egypt",        name: "Egypt",                 flag: "🇪🇬", group: "G" },
  newzealand:   { id: "newzealand",   name: "New Zealand",           flag: "🇳🇿", group: "G" },

  // GROUP H — Opens Jun 15
  spain:        { id: "spain",        name: "Spain",                 flag: "🇪🇸", group: "H" },
  uruguay:      { id: "uruguay",      name: "Uruguay",               flag: "🇺🇾", group: "H" },
  saudiarabia:  { id: "saudiarabia",  name: "Saudi Arabia",          flag: "🇸🇦", group: "H" },
  capeverde:    { id: "capeverde",    name: "Cape Verde",            flag: "🇨🇻", group: "H" },

  // GROUP I — Opens Jun 16 (all Eastern US venues)
  france:       { id: "france",       name: "France",                flag: "🇫🇷", group: "I" },
  senegal:      { id: "senegal",      name: "Senegal",               flag: "🇸🇳", group: "I" },
  norway:       { id: "norway",       name: "Norway",                flag: "🇳🇴", group: "I" },
  iraq:         { id: "iraq",         name: "Iraq",                  flag: "🇮🇶", group: "I" },

  // GROUP J — Opens Jun 16
  argentina:    { id: "argentina",    name: "Argentina",             flag: "🇦🇷", group: "J" },
  austria:      { id: "austria",      name: "Austria",               flag: "🇦🇹", group: "J" },
  algeria:      { id: "algeria",      name: "Algeria",               flag: "🇩🇿", group: "J" },
  jordan:       { id: "jordan",       name: "Jordan",                flag: "🇯🇴", group: "J" },

  // GROUP K — Opens Jun 17
  portugal:     { id: "portugal",     name: "Portugal",              flag: "🇵🇹", group: "K" },
  colombia:     { id: "colombia",     name: "Colombia",              flag: "🇨🇴", group: "K" },
  uzbekistan:   { id: "uzbekistan",   name: "Uzbekistan",            flag: "🇺🇿", group: "K" },
  drcongo:      { id: "drcongo",      name: "DR Congo",              flag: "🇨🇩", group: "K" },

  // GROUP L — Opens Jun 17
  england:      { id: "england",      name: "England",               flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  croatia:      { id: "croatia",      name: "Croatia",               flag: "🇭🇷", group: "L" },
  panama:       { id: "panama",       name: "Panama",                flag: "🇵🇦", group: "L" },
  ghana:        { id: "ghana",        name: "Ghana",                 flag: "🇬🇭", group: "L" },
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP STAGE MATCHES — All 72 matches (12 groups × 6 matches each)
// Match IDs = official FIFA match numbers
// Kickoff times: ✅ = confirmed from Wikipedia | ⚠️ = date confirmed, time TBD (uses 20:00 UTC placeholder)
// Source: Wikipedia individual Group pages A–L
// ─────────────────────────────────────────────────────────────────────────────
const matches: Match[] = [

  // GROUP A — Mexico, South Korea, South Africa, Czech Republic
  // Source: ESPN API (all times UTC, venues verified)
  { id: "m1",  homeTeam: teams.mexico,       awayTeam: teams.southafrica,   kickoff: "2026-06-11T19:00:00Z", venue: venues.azteca,       group: "A", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m2",  homeTeam: teams.southkorea,   awayTeam: teams.czechrepublic, kickoff: "2026-06-12T02:00:00Z", venue: venues.akron,        group: "A", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m25", homeTeam: teams.czechrepublic,awayTeam: teams.southafrica,   kickoff: "2026-06-18T16:00:00Z", venue: venues.mercedesbenz, group: "A", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m28", homeTeam: teams.mexico,       awayTeam: teams.southkorea,    kickoff: "2026-06-19T01:00:00Z", venue: venues.akron,        group: "A", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m53", homeTeam: teams.czechrepublic,awayTeam: teams.mexico,        kickoff: "2026-06-25T01:00:00Z", venue: venues.azteca,       group: "A", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m54", homeTeam: teams.southafrica,  awayTeam: teams.southkorea,    kickoff: "2026-06-25T01:00:00Z", venue: venues.bbva,         group: "A", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP B — Canada, Switzerland, Qatar, Bosnia and Herzegovina
  { id: "m3",  homeTeam: teams.canada,       awayTeam: teams.bosnia,        kickoff: "2026-06-12T19:00:00Z", venue: venues.bmo,          group: "B", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m8",  homeTeam: teams.qatar,        awayTeam: teams.switzerland,   kickoff: "2026-06-13T19:00:00Z", venue: venues.levis,        group: "B", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m26", homeTeam: teams.switzerland,  awayTeam: teams.bosnia,        kickoff: "2026-06-18T19:00:00Z", venue: venues.sofi,         group: "B", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m27", homeTeam: teams.canada,       awayTeam: teams.qatar,         kickoff: "2026-06-18T22:00:00Z", venue: venues.bcplace,      group: "B", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m51", homeTeam: teams.switzerland,  awayTeam: teams.canada,        kickoff: "2026-06-24T19:00:00Z", venue: venues.bcplace,      group: "B", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m52", homeTeam: teams.bosnia,       awayTeam: teams.qatar,         kickoff: "2026-06-24T19:00:00Z", venue: venues.lumen,        group: "B", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP C — Brazil, Morocco, Scotland, Haiti
  { id: "m7",  homeTeam: teams.brazil,       awayTeam: teams.morocco,       kickoff: "2026-06-13T22:00:00Z", venue: venues.metlife,      group: "C", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m5",  homeTeam: teams.haiti,        awayTeam: teams.scotland,      kickoff: "2026-06-14T01:00:00Z", venue: venues.gillette,     group: "C", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m30", homeTeam: teams.scotland,     awayTeam: teams.morocco,       kickoff: "2026-06-19T22:00:00Z", venue: venues.gillette,     group: "C", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m29", homeTeam: teams.brazil,       awayTeam: teams.haiti,         kickoff: "2026-06-20T00:30:00Z", venue: venues.lincoln,      group: "C", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m49", homeTeam: teams.scotland,     awayTeam: teams.brazil,        kickoff: "2026-06-24T22:00:00Z", venue: venues.hardrock,     group: "C", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m50", homeTeam: teams.morocco,      awayTeam: teams.haiti,         kickoff: "2026-06-24T22:00:00Z", venue: venues.mercedesbenz, group: "C", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP D — United States, Australia, Paraguay, Turkey (West Coast)
  { id: "m4",  homeTeam: teams.usa,          awayTeam: teams.paraguay,      kickoff: "2026-06-13T01:00:00Z", venue: venues.sofi,         group: "D", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m6",  homeTeam: teams.australia,    awayTeam: teams.turkey,        kickoff: "2026-06-14T04:00:00Z", venue: venues.bcplace,      group: "D", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m32", homeTeam: teams.usa,          awayTeam: teams.australia,     kickoff: "2026-06-19T19:00:00Z", venue: venues.lumen,        group: "D", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m31", homeTeam: teams.turkey,       awayTeam: teams.paraguay,      kickoff: "2026-06-20T03:00:00Z", venue: venues.levis,        group: "D", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m59", homeTeam: teams.turkey,       awayTeam: teams.usa,           kickoff: "2026-06-26T02:00:00Z", venue: venues.sofi,         group: "D", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m60", homeTeam: teams.paraguay,     awayTeam: teams.australia,     kickoff: "2026-06-26T02:00:00Z", venue: venues.levis,        group: "D", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP E — Germany, Ecuador, Ivory Coast, Curacao
  { id: "m10", homeTeam: teams.germany,      awayTeam: teams.curacao,       kickoff: "2026-06-14T17:00:00Z", venue: venues.nrg,          group: "E", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m9",  homeTeam: teams.ivorycoast,   awayTeam: teams.ecuador,       kickoff: "2026-06-14T23:00:00Z", venue: venues.lincoln,      group: "E", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m33", homeTeam: teams.germany,      awayTeam: teams.ivorycoast,    kickoff: "2026-06-20T20:00:00Z", venue: venues.bmo,          group: "E", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m34", homeTeam: teams.ecuador,      awayTeam: teams.curacao,       kickoff: "2026-06-21T00:00:00Z", venue: venues.arrowhead,    group: "E", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m55", homeTeam: teams.curacao,      awayTeam: teams.ivorycoast,    kickoff: "2026-06-25T20:00:00Z", venue: venues.lincoln,      group: "E", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m56", homeTeam: teams.ecuador,      awayTeam: teams.germany,       kickoff: "2026-06-25T20:00:00Z", venue: venues.metlife,      group: "E", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP F — Netherlands, Japan, Sweden, Tunisia
  { id: "m11", homeTeam: teams.netherlands,  awayTeam: teams.japan,         kickoff: "2026-06-14T20:00:00Z", venue: venues.att,          group: "F", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m12", homeTeam: teams.sweden,       awayTeam: teams.tunisia,       kickoff: "2026-06-15T02:00:00Z", venue: venues.bbva,         group: "F", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m35", homeTeam: teams.netherlands,  awayTeam: teams.sweden,        kickoff: "2026-06-20T17:00:00Z", venue: venues.nrg,          group: "F", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m36", homeTeam: teams.tunisia,      awayTeam: teams.japan,         kickoff: "2026-06-21T04:00:00Z", venue: venues.bbva,         group: "F", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m57", homeTeam: teams.japan,        awayTeam: teams.sweden,        kickoff: "2026-06-25T23:00:00Z", venue: venues.att,          group: "F", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m58", homeTeam: teams.tunisia,      awayTeam: teams.netherlands,   kickoff: "2026-06-25T23:00:00Z", venue: venues.arrowhead,    group: "F", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP G — Belgium, Iran, Egypt, New Zealand (all West Coast USA/Canada)
  { id: "m16", homeTeam: teams.belgium,      awayTeam: teams.egypt,         kickoff: "2026-06-15T19:00:00Z", venue: venues.lumen,        group: "G", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m15", homeTeam: teams.iran,         awayTeam: teams.newzealand,    kickoff: "2026-06-16T01:00:00Z", venue: venues.sofi,         group: "G", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m39", homeTeam: teams.belgium,      awayTeam: teams.iran,          kickoff: "2026-06-21T19:00:00Z", venue: venues.sofi,         group: "G", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m40", homeTeam: teams.newzealand,   awayTeam: teams.egypt,         kickoff: "2026-06-22T01:00:00Z", venue: venues.bcplace,      group: "G", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m63", homeTeam: teams.egypt,        awayTeam: teams.iran,          kickoff: "2026-06-27T03:00:00Z", venue: venues.lumen,        group: "G", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m64", homeTeam: teams.newzealand,   awayTeam: teams.belgium,       kickoff: "2026-06-27T03:00:00Z", venue: venues.bcplace,      group: "G", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP H — Spain, Uruguay, Saudi Arabia, Cape Verde
  { id: "m14", homeTeam: teams.spain,        awayTeam: teams.capeverde,     kickoff: "2026-06-15T16:00:00Z", venue: venues.mercedesbenz, group: "H", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m13", homeTeam: teams.saudiarabia,  awayTeam: teams.uruguay,       kickoff: "2026-06-15T22:00:00Z", venue: venues.hardrock,     group: "H", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m38", homeTeam: teams.spain,        awayTeam: teams.saudiarabia,   kickoff: "2026-06-21T16:00:00Z", venue: venues.mercedesbenz, group: "H", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m37", homeTeam: teams.uruguay,      awayTeam: teams.capeverde,     kickoff: "2026-06-21T22:00:00Z", venue: venues.hardrock,     group: "H", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m65", homeTeam: teams.capeverde,    awayTeam: teams.saudiarabia,   kickoff: "2026-06-27T00:00:00Z", venue: venues.nrg,          group: "H", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m66", homeTeam: teams.uruguay,      awayTeam: teams.spain,         kickoff: "2026-06-27T00:00:00Z", venue: venues.akron,        group: "H", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP I — France, Senegal, Norway, Iraq
  { id: "m17", homeTeam: teams.france,       awayTeam: teams.senegal,       kickoff: "2026-06-16T19:00:00Z", venue: venues.metlife,      group: "I", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m18", homeTeam: teams.iraq,         awayTeam: teams.norway,        kickoff: "2026-06-16T22:00:00Z", venue: venues.gillette,     group: "I", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m42", homeTeam: teams.france,       awayTeam: teams.iraq,          kickoff: "2026-06-22T21:00:00Z", venue: venues.lincoln,      group: "I", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m41", homeTeam: teams.norway,       awayTeam: teams.senegal,       kickoff: "2026-06-23T00:00:00Z", venue: venues.metlife,      group: "I", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m61", homeTeam: teams.norway,       awayTeam: teams.france,        kickoff: "2026-06-26T19:00:00Z", venue: venues.gillette,     group: "I", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m62", homeTeam: teams.senegal,      awayTeam: teams.iraq,          kickoff: "2026-06-26T19:00:00Z", venue: venues.bmo,          group: "I", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP J — Argentina, Austria, Algeria, Jordan
  { id: "m19", homeTeam: teams.argentina,    awayTeam: teams.algeria,       kickoff: "2026-06-17T01:00:00Z", venue: venues.arrowhead,    group: "J", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m20", homeTeam: teams.austria,      awayTeam: teams.jordan,        kickoff: "2026-06-17T04:00:00Z", venue: venues.levis,        group: "J", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m43", homeTeam: teams.argentina,    awayTeam: teams.austria,       kickoff: "2026-06-22T17:00:00Z", venue: venues.att,          group: "J", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m44", homeTeam: teams.jordan,       awayTeam: teams.algeria,       kickoff: "2026-06-23T03:00:00Z", venue: venues.levis,        group: "J", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m69", homeTeam: teams.algeria,      awayTeam: teams.austria,       kickoff: "2026-06-28T02:00:00Z", venue: venues.arrowhead,    group: "J", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m70", homeTeam: teams.jordan,       awayTeam: teams.argentina,     kickoff: "2026-06-28T02:00:00Z", venue: venues.att,          group: "J", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP K — Portugal, Colombia, Uzbekistan, DR Congo
  { id: "m23", homeTeam: teams.portugal,     awayTeam: teams.drcongo,       kickoff: "2026-06-17T17:00:00Z", venue: venues.nrg,          group: "K", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m24", homeTeam: teams.uzbekistan,   awayTeam: teams.colombia,      kickoff: "2026-06-18T02:00:00Z", venue: venues.azteca,       group: "K", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m47", homeTeam: teams.portugal,     awayTeam: teams.uzbekistan,    kickoff: "2026-06-23T17:00:00Z", venue: venues.nrg,          group: "K", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m48", homeTeam: teams.colombia,     awayTeam: teams.drcongo,       kickoff: "2026-06-24T02:00:00Z", venue: venues.akron,        group: "K", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m71", homeTeam: teams.colombia,     awayTeam: teams.portugal,      kickoff: "2026-06-27T23:30:00Z", venue: venues.hardrock,     group: "K", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m72", homeTeam: teams.drcongo,      awayTeam: teams.uzbekistan,    kickoff: "2026-06-27T23:30:00Z", venue: venues.mercedesbenz, group: "K", round: "Group Stage", status: "upcoming", matchday: 3 },

  // GROUP L — England, Croatia, Panama, Ghana
  { id: "m22", homeTeam: teams.england,      awayTeam: teams.croatia,       kickoff: "2026-06-17T20:00:00Z", venue: venues.att,          group: "L", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m21", homeTeam: teams.ghana,        awayTeam: teams.panama,        kickoff: "2026-06-17T23:00:00Z", venue: venues.bmo,          group: "L", round: "Group Stage", status: "upcoming", matchday: 1 },
  { id: "m45", homeTeam: teams.england,      awayTeam: teams.ghana,         kickoff: "2026-06-23T20:00:00Z", venue: venues.gillette,     group: "L", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m46", homeTeam: teams.panama,       awayTeam: teams.croatia,       kickoff: "2026-06-23T23:00:00Z", venue: venues.bmo,          group: "L", round: "Group Stage", status: "upcoming", matchday: 2 },
  { id: "m67", homeTeam: teams.panama,       awayTeam: teams.england,       kickoff: "2026-06-27T21:00:00Z", venue: venues.metlife,      group: "L", round: "Group Stage", status: "upcoming", matchday: 3 },
  { id: "m68", homeTeam: teams.croatia,      awayTeam: teams.ghana,         kickoff: "2026-06-27T21:00:00Z", venue: venues.lincoln,      group: "L", round: "Group Stage", status: "upcoming", matchday: 3 },
]

// Helper to make a TBD placeholder team
function tbd(label: string): Team { return { id: label.replace(/\s+/g, '-').toLowerCase(), name: label, flag: '🏆' } }

// ─────────────────────────────────────────────────────────────────────────────
// KNOCKOUT STAGE — Round of 32 through Final
// All TBD — determined by group stage results
// ─────────────────────────────────────────────────────────────────────────────
const knockoutMatches: Match[] = [
  // ── Round of 32 (Jun 28 – Jul 6) — FIFA official match numbers 73–88 ──
  // Seedings per official FIFA WC2026 bracket announcement
  { id: "r32-1",  homeTeam: tbd("2nd Group A"), awayTeam: tbd("2nd Group B"),        kickoff: "2026-06-28T22:00:00Z", venue: venues.metlife,      round: "Round of 32", status: "upcoming" },
  { id: "r32-2",  homeTeam: tbd("1st Group E"),   awayTeam: tbd("Best 3rd A/B/C/D/F"), kickoff: "2026-06-29T02:00:00Z", venue: venues.att,          round: "Round of 32", status: "upcoming" },
  { id: "r32-3",  homeTeam: tbd("1st Group F"),   awayTeam: tbd("2nd Group C"),         kickoff: "2026-06-29T22:00:00Z", venue: venues.sofi,         round: "Round of 32", status: "upcoming" },
  { id: "r32-4",  homeTeam: tbd("1st Group C"),   awayTeam: tbd("2nd Group F"),         kickoff: "2026-06-30T02:00:00Z", venue: venues.hardrock,     round: "Round of 32", status: "upcoming" },
  { id: "r32-5",  homeTeam: tbd("1st Group I"),   awayTeam: tbd("Best 3rd C/D/F/G/H"), kickoff: "2026-06-30T22:00:00Z", venue: venues.nrg,          round: "Round of 32", status: "upcoming" },
  { id: "r32-6",  homeTeam: tbd("2nd Group E"), awayTeam: tbd("2nd Group I"),         kickoff: "2026-07-01T02:00:00Z", venue: venues.lumen,        round: "Round of 32", status: "upcoming" },
  { id: "r32-7",  homeTeam: tbd("1st Group A"),   awayTeam: tbd("Best 3rd C/E/F/H/I"), kickoff: "2026-07-01T22:00:00Z", venue: venues.gillette,     round: "Round of 32", status: "upcoming" },
  { id: "r32-8",  homeTeam: tbd("1st Group L"),   awayTeam: tbd("Best 3rd E/H/I/J/K"), kickoff: "2026-07-02T02:00:00Z", venue: venues.levis,        round: "Round of 32", status: "upcoming" },
  { id: "r32-9",  homeTeam: tbd("1st Group D"),   awayTeam: tbd("Best 3rd B/E/F/I/J"), kickoff: "2026-07-02T22:00:00Z", venue: venues.azteca,       round: "Round of 32", status: "upcoming" },
  { id: "r32-10", homeTeam: tbd("1st Group G"),   awayTeam: tbd("Best 3rd A/E/H/I/J"), kickoff: "2026-07-03T02:00:00Z", venue: venues.bcplace,      round: "Round of 32", status: "upcoming" },
  { id: "r32-11", homeTeam: tbd("2nd Group K"), awayTeam: tbd("2nd Group L"),         kickoff: "2026-07-03T22:00:00Z", venue: venues.arrowhead,    round: "Round of 32", status: "upcoming" },
  { id: "r32-12", homeTeam: tbd("1st Group H"),   awayTeam: tbd("2nd Group J"),         kickoff: "2026-07-04T02:00:00Z", venue: venues.mercedesbenz, round: "Round of 32", status: "upcoming" },
  { id: "r32-13", homeTeam: tbd("1st Group B"),   awayTeam: tbd("Best 3rd E/F/G/I/J"), kickoff: "2026-07-04T22:00:00Z", venue: venues.lincoln,      round: "Round of 32", status: "upcoming" },
  { id: "r32-14", homeTeam: tbd("1st Group J"),   awayTeam: tbd("2nd Group H"),         kickoff: "2026-07-05T02:00:00Z", venue: venues.bmo,          round: "Round of 32", status: "upcoming" },
  { id: "r32-15", homeTeam: tbd("1st Group K"),   awayTeam: tbd("Best 3rd D/E/I/J/L"), kickoff: "2026-07-05T22:00:00Z", venue: venues.bbva,         round: "Round of 32", status: "upcoming" },
  { id: "r32-16", homeTeam: tbd("2nd Group D"), awayTeam: tbd("2nd Group G"),         kickoff: "2026-07-06T02:00:00Z", venue: venues.akron,        round: "Round of 32", status: "upcoming" },

  // ── Round of 16 (Jul 6 – Jul 10) ──
  { id: "r16-1", homeTeam: tbd("W R32-1"),  awayTeam: tbd("W R32-2"),  kickoff: "2026-07-06T22:00:00Z", venue: venues.metlife,  round: "Round of 16", status: "upcoming" },
  { id: "r16-2", homeTeam: tbd("W R32-3"),  awayTeam: tbd("W R32-4"),  kickoff: "2026-07-07T02:00:00Z", venue: venues.att,      round: "Round of 16", status: "upcoming" },
  { id: "r16-3", homeTeam: tbd("W R32-5"),  awayTeam: tbd("W R32-6"),  kickoff: "2026-07-07T22:00:00Z", venue: venues.sofi,     round: "Round of 16", status: "upcoming" },
  { id: "r16-4", homeTeam: tbd("W R32-7"),  awayTeam: tbd("W R32-8"),  kickoff: "2026-07-08T02:00:00Z", venue: venues.hardrock, round: "Round of 16", status: "upcoming" },
  { id: "r16-5", homeTeam: tbd("W R32-9"),  awayTeam: tbd("W R32-10"), kickoff: "2026-07-08T22:00:00Z", venue: venues.nrg,      round: "Round of 16", status: "upcoming" },
  { id: "r16-6", homeTeam: tbd("W R32-11"), awayTeam: tbd("W R32-12"), kickoff: "2026-07-09T02:00:00Z", venue: venues.gillette, round: "Round of 16", status: "upcoming" },
  { id: "r16-7", homeTeam: tbd("W R32-13"), awayTeam: tbd("W R32-14"), kickoff: "2026-07-09T22:00:00Z", venue: venues.azteca,   round: "Round of 16", status: "upcoming" },
  { id: "r16-8", homeTeam: tbd("W R32-15"), awayTeam: tbd("W R32-16"), kickoff: "2026-07-10T02:00:00Z", venue: venues.lumen,    round: "Round of 16", status: "upcoming" },

  // ── Quarter-Finals (Jul 11–12) ──
  { id: "qf-1", homeTeam: tbd("W R16-1"), awayTeam: tbd("W R16-2"), kickoff: "2026-07-11T22:00:00Z", venue: venues.metlife,  round: "Quarter-Finals", status: "upcoming" },
  { id: "qf-2", homeTeam: tbd("W R16-3"), awayTeam: tbd("W R16-4"), kickoff: "2026-07-12T02:00:00Z", venue: venues.sofi,     round: "Quarter-Finals", status: "upcoming" },
  { id: "qf-3", homeTeam: tbd("W R16-5"), awayTeam: tbd("W R16-6"), kickoff: "2026-07-12T22:00:00Z", venue: venues.att,      round: "Quarter-Finals", status: "upcoming" },
  { id: "qf-4", homeTeam: tbd("W R16-7"), awayTeam: tbd("W R16-8"), kickoff: "2026-07-13T02:00:00Z", venue: venues.hardrock, round: "Quarter-Finals", status: "upcoming" },

  // ── Semi-Finals (Jul 14–15) ──
  { id: "sf-1", homeTeam: tbd("W QF-1"), awayTeam: tbd("W QF-2"), kickoff: "2026-07-14T23:00:00Z", venue: venues.metlife, round: "Semi-Finals", status: "upcoming" },
  { id: "sf-2", homeTeam: tbd("W QF-3"), awayTeam: tbd("W QF-4"), kickoff: "2026-07-15T23:00:00Z", venue: venues.att,     round: "Semi-Finals", status: "upcoming" },

  // ── Third Place (Jul 18) ──
  { id: "3rd-1", homeTeam: tbd("SF Loser 1"), awayTeam: tbd("SF Loser 2"), kickoff: "2026-07-18T22:00:00Z", venue: venues.mercedesbenz, round: "Third Place", status: "upcoming" },

  // ── Final (Jul 19) — MetLife Stadium, East Rutherford NJ ──
  { id: "final-1", homeTeam: tbd("SF Winner 1"), awayTeam: tbd("SF Winner 2"), kickoff: "2026-07-19T23:00:00Z", venue: venues.metlife, round: "Final", status: "upcoming" },
]

function computeStandings(groupId: string): Standing[] {
  const groupTeamIds = Object.values(teams)
    .filter(t => t.group === groupId)
    .map(t => t.id)

  const standingMap: Record<string, Standing> = {}
  for (const tid of groupTeamIds) {
    standingMap[tid] = {
      team: teams[tid],
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    }
  }

  const groupMatches = matches.filter(m => m.group === groupId && m.status === "ft")
  for (const m of groupMatches) {
    const h = standingMap[m.homeTeam.id]
    const a = standingMap[m.awayTeam.id]
    if (!h || !a) continue
    const hg = m.homeScore ?? 0
    const ag = m.awayScore ?? 0
    h.played++; a.played++
    h.goalsFor += hg; h.goalsAgainst += ag
    a.goalsFor += ag; a.goalsAgainst += hg
    if (hg > ag) { h.won++; h.points += 3; a.lost++ }
    else if (hg < ag) { a.won++; a.points += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.points++; a.points++ }
  }

  for (const s of Object.values(standingMap)) {
    s.goalDiff = s.goalsFor - s.goalsAgainst
  }

  return Object.values(standingMap).sort((a, b) =>
    b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
  )
}

function getBracket(): BracketRound[] {
  // ── Compute current standings for all groups ──────────────────────────────
  const allStandings: Record<string, Standing[]> = {}
  for (const gid of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
    allStandings[gid] = computeStandings(gid)
  }

  // A group is "complete" only when all 6 of its matches are finished
  function isGroupComplete(groupId: string): boolean {
    const gm = matches.filter(m => m.group === groupId)
    return gm.length > 0 && gm.every(m => m.status === 'ft')
  }

  // Resolve a winner slot: return real Team when group is done, else a clean label
  function resolveWinner(groupId: string): Team | string {
    const label = `1st Group ${groupId}`
    if (!isGroupComplete(groupId)) return label
    return allStandings[groupId]?.[0]?.team ?? label
  }

  // Resolve a runner-up slot: return real Team when group is done, else a clean label
  function resolveRunnerUp(groupId: string): Team | string {
    const label = `2nd Group ${groupId}`
    if (!isGroupComplete(groupId)) return label
    return allStandings[groupId]?.[1]?.team ?? label
  }

  // Build a BracketSlot, pulling venue + kickoff from the knockoutMatches entry
  function makeSlot(id: string, home: Team | string, away: Team | string): BracketSlot {
    const km = knockoutMatches.find(k => k.id === id)
    const bothKnown = typeof home !== 'string' && typeof away !== 'string'
    const kmStatus = km?.status as BracketSlot['status'] | undefined
    return {
      id,
      home,
      away,
      kickoff: km?.kickoff,
      venue: km?.venue,
      homeScore: km?.homeScore,
      awayScore: km?.awayScore,
      // Only mark 'upcoming' (teams known, match not yet played) or live/ft when both teams are set
      status: bothKnown ? (kmStatus ?? 'upcoming') : 'tbd',
    }
  }

  // ── Round of 32 — actual FIFA WC2026 seedings (Matches 73–88) ─────────────
  // Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
  //   M73: 2nd A vs 2nd B          M74: W E vs Best3rd(A/B/C/D/F)
  //   M75: W F  vs 2nd C           M76: W C  vs 2nd F
  //   M77: W I  vs Best3rd(C/D/F/G/H) M78: 2nd E vs 2nd I
  //   M79: W A  vs Best3rd(C/E/F/H/I) M80: W L  vs Best3rd(E/H/I/J/K)
  //   M81: W D  vs Best3rd(B/E/F/I/J) M82: W G  vs Best3rd(A/E/H/I/J)
  //   M83: 2nd K vs 2nd L          M84: W H  vs 2nd J
  //   M85: W B  vs Best3rd(E/F/G/I/J) M86: W J  vs 2nd H
  //   M87: W K  vs Best3rd(D/E/I/J/L) M88: 2nd D vs 2nd G
  const r32Slots: BracketSlot[] = [
    makeSlot('r32-1',  resolveRunnerUp('A'), resolveRunnerUp('B')),
    makeSlot('r32-2',  resolveWinner('E'),   'Best 3rd A/B/C/D/F'),
    makeSlot('r32-3',  resolveWinner('F'),   resolveRunnerUp('C')),
    makeSlot('r32-4',  resolveWinner('C'),   resolveRunnerUp('F')),
    makeSlot('r32-5',  resolveWinner('I'),   'Best 3rd C/D/F/G/H'),
    makeSlot('r32-6',  resolveRunnerUp('E'), resolveRunnerUp('I')),
    makeSlot('r32-7',  resolveWinner('A'),   'Best 3rd C/E/F/H/I'),
    makeSlot('r32-8',  resolveWinner('L'),   'Best 3rd E/H/I/J/K'),
    makeSlot('r32-9',  resolveWinner('D'),   'Best 3rd B/E/F/I/J'),
    makeSlot('r32-10', resolveWinner('G'),   'Best 3rd A/E/H/I/J'),
    makeSlot('r32-11', resolveRunnerUp('K'), resolveRunnerUp('L')),
    makeSlot('r32-12', resolveWinner('H'),   resolveRunnerUp('J')),
    makeSlot('r32-13', resolveWinner('B'),   'Best 3rd E/F/G/I/J'),
    makeSlot('r32-14', resolveWinner('J'),   resolveRunnerUp('H')),
    makeSlot('r32-15', resolveWinner('K'),   'Best 3rd D/E/I/J/L'),
    makeSlot('r32-16', resolveRunnerUp('D'), resolveRunnerUp('G')),
  ]

  // ── Rounds beyond R32 — TBD; pull venue/kickoff from knockoutMatches ──────
  const r16Slots: BracketSlot[] = Array.from({ length: 8 }, (_, i) => {
    const id = `r16-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home: `W R32-${i * 2 + 1}`, away: `W R32-${i * 2 + 2}`, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })

  const qfSlots: BracketSlot[] = Array.from({ length: 4 }, (_, i) => {
    const id = `qf-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home: `W R16-${i * 2 + 1}`, away: `W R16-${i * 2 + 2}`, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })

  const sfSlots: BracketSlot[] = Array.from({ length: 2 }, (_, i) => {
    const id = `sf-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home: `W QF-${i * 2 + 1}`, away: `W QF-${i * 2 + 2}`, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })

  const km3rd   = knockoutMatches.find(k => k.id === '3rd-1')
  const kmFinal = knockoutMatches.find(k => k.id === 'final-1')

  return [
    { name: "Round of 32",    matches: r32Slots },
    { name: "Round of 16",    matches: r16Slots },
    { name: "Quarter-Finals", matches: qfSlots },
    { name: "Semi-Finals",    matches: sfSlots },
    { name: "Third Place",    matches: [{ id: "3rd-1",   home: "SF Loser 1",   away: "SF Loser 2",   kickoff: km3rd?.kickoff,   venue: km3rd?.venue,   status: "tbd" }] },
    { name: "Final",          matches: [{ id: "final-1", home: "SF Winner 1",  away: "SF Winner 2",  kickoff: kmFinal?.kickoff, venue: kmFinal?.venue, status: "tbd" }] },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM STATS — Historical World Cup records
// FIFA Rankings as of November 2025 (used for draw seeding)
// ─────────────────────────────────────────────────────────────────────────────
const teamStats: Record<string, TeamStats> = {
  // Group A
  mexico:        { fifaRank: 15, worldCupAppearances: 17, wcWins: 16, wcDraws: 14, wcLosses: 27, wcGoalsFor: 60,  wcGoalsAgainst: 101, bestFinish: "QF (×5)" },
  southkorea:    { fifaRank: 22, worldCupAppearances: 11, wcWins: 8,  wcDraws: 8,  wcLosses: 20, wcGoalsFor: 36,  wcGoalsAgainst: 74,  bestFinish: "4th (2002)" },
  southafrica:   { fifaRank: 61, worldCupAppearances: 3,  wcWins: 1,  wcDraws: 3,  wcLosses: 3,  wcGoalsFor: 6,   wcGoalsAgainst: 11,  bestFinish: "Group Stage" },
  czechrepublic: { fifaRank: 44, worldCupAppearances: 9,  wcWins: 12, wcDraws: 6,  wcLosses: 12, wcGoalsFor: 46,  wcGoalsAgainst: 45,  bestFinish: "2nd (1934, 1962)" },
  // Group B
  canada:        { fifaRank: 27, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 0,  wcLosses: 4,  wcGoalsFor: 2,   wcGoalsAgainst: 10,  bestFinish: "Group Stage" },
  switzerland:   { fifaRank: 17, worldCupAppearances: 12, wcWins: 17, wcDraws: 10, wcLosses: 15, wcGoalsFor: 68,  wcGoalsAgainst: 65,  bestFinish: "QF (×3)" },
  qatar:         { fifaRank: 51, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 0,  wcLosses: 6,  wcGoalsFor: 5,   wcGoalsAgainst: 17,  bestFinish: "Group Stage" },
  bosnia:        { fifaRank: 71, worldCupAppearances: 2,  wcWins: 1,  wcDraws: 0,  wcLosses: 2,  wcGoalsFor: 4,   wcGoalsAgainst: 4,   bestFinish: "Group Stage" },
  // Group C
  brazil:        { fifaRank: 5,  worldCupAppearances: 22, wcWins: 73, wcDraws: 18, wcLosses: 19, wcGoalsFor: 237, wcGoalsAgainst: 105, bestFinish: "Champions (×5)" },
  morocco:       { fifaRank: 11, worldCupAppearances: 7,  wcWins: 6,  wcDraws: 5,  wcLosses: 9,  wcGoalsFor: 16,  wcGoalsAgainst: 27,  bestFinish: "4th (2022)" },
  scotland:      { fifaRank: 36, worldCupAppearances: 8,  wcWins: 4,  wcDraws: 7,  wcLosses: 12, wcGoalsFor: 25,  wcGoalsAgainst: 41,  bestFinish: "Group Stage" },
  haiti:         { fifaRank: 84, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 1,  wcLosses: 5,  wcGoalsFor: 2,   wcGoalsAgainst: 14,  bestFinish: "Group Stage" },
  // Group D
  usa:           { fifaRank: 14, worldCupAppearances: 11, wcWins: 10, wcDraws: 7,  wcLosses: 12, wcGoalsFor: 38,  wcGoalsAgainst: 42,  bestFinish: "3rd (1930)" },
  australia:     { fifaRank: 26, worldCupAppearances: 6,  wcWins: 5,  wcDraws: 2,  wcLosses: 12, wcGoalsFor: 19,  wcGoalsAgainst: 39,  bestFinish: "QF (2006)" },
  paraguay:      { fifaRank: 39, worldCupAppearances: 9,  wcWins: 8,  wcDraws: 9,  wcLosses: 10, wcGoalsFor: 30,  wcGoalsAgainst: 36,  bestFinish: "QF (2010)" },
  turkey:        { fifaRank: 25, worldCupAppearances: 3,  wcWins: 6,  wcDraws: 1,  wcLosses: 4,  wcGoalsFor: 24,  wcGoalsAgainst: 20,  bestFinish: "3rd (2002)" },
  // Group E
  germany:       { fifaRank: 9,  worldCupAppearances: 20, wcWins: 67, wcDraws: 20, wcLosses: 20, wcGoalsFor: 226, wcGoalsAgainst: 125, bestFinish: "Champions (×4)" },
  ecuador:       { fifaRank: 23, worldCupAppearances: 4,  wcWins: 4,  wcDraws: 2,  wcLosses: 7,  wcGoalsFor: 14,  wcGoalsAgainst: 22,  bestFinish: "QF (2006)" },
  ivorycoast:    { fifaRank: 42, worldCupAppearances: 4,  wcWins: 2,  wcDraws: 2,  wcLosses: 8,  wcGoalsFor: 11,  wcGoalsAgainst: 26,  bestFinish: "Group Stage" },
  curacao:       { fifaRank: 82, worldCupAppearances: 0,  wcWins: 0,  wcDraws: 0,  wcLosses: 0,  wcGoalsFor: 0,   wcGoalsAgainst: 0,   bestFinish: "Debut 2026" },
  // Group F
  netherlands:   { fifaRank: 7,  worldCupAppearances: 11, wcWins: 27, wcDraws: 14, wcLosses: 13, wcGoalsFor: 90,  wcGoalsAgainst: 57,  bestFinish: "2nd (×3)" },
  japan:         { fifaRank: 18, worldCupAppearances: 8,  wcWins: 9,  wcDraws: 5,  wcLosses: 10, wcGoalsFor: 27,  wcGoalsAgainst: 33,  bestFinish: "R16 (×4)" },
  tunisia:       { fifaRank: 40, worldCupAppearances: 6,  wcWins: 1,  wcDraws: 4,  wcLosses: 13, wcGoalsFor: 9,   wcGoalsAgainst: 31,  bestFinish: "Group Stage" },
  sweden:        { fifaRank: 43, worldCupAppearances: 12, wcWins: 16, wcDraws: 8,  wcLosses: 18, wcGoalsFor: 74,  wcGoalsAgainst: 69,  bestFinish: "2nd (1958)" },
  // Group G
  belgium:       { fifaRank: 8,  worldCupAppearances: 14, wcWins: 18, wcDraws: 10, wcLosses: 20, wcGoalsFor: 68,  wcGoalsAgainst: 72,  bestFinish: "3rd (2018)" },
  iran:          { fifaRank: 20, worldCupAppearances: 6,  wcWins: 3,  wcDraws: 3,  wcLosses: 11, wcGoalsFor: 12,  wcGoalsAgainst: 34,  bestFinish: "Group Stage" },
  egypt:         { fifaRank: 34, worldCupAppearances: 3,  wcWins: 2,  wcDraws: 2,  wcLosses: 5,  wcGoalsFor: 10,  wcGoalsAgainst: 15,  bestFinish: "Group Stage" },
  newzealand:    { fifaRank: 86, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 1,  wcLosses: 5,  wcGoalsFor: 4,   wcGoalsAgainst: 17,  bestFinish: "Group Stage" },
  // Group H
  spain:         { fifaRank: 1,  worldCupAppearances: 16, wcWins: 30, wcDraws: 17, wcLosses: 16, wcGoalsFor: 104, wcGoalsAgainst: 74,  bestFinish: "Champions (2010)" },
  uruguay:       { fifaRank: 16, worldCupAppearances: 14, wcWins: 23, wcDraws: 8,  wcLosses: 17, wcGoalsFor: 89,  wcGoalsAgainst: 68,  bestFinish: "Champions (×2)" },
  saudiarabia:   { fifaRank: 60, worldCupAppearances: 6,  wcWins: 4,  wcDraws: 3,  wcLosses: 11, wcGoalsFor: 17,  wcGoalsAgainst: 43,  bestFinish: "R16 (1994)" },
  capeverde:     { fifaRank: 68, worldCupAppearances: 0,  wcWins: 0,  wcDraws: 0,  wcLosses: 0,  wcGoalsFor: 0,   wcGoalsAgainst: 0,   bestFinish: "Debut 2026" },
  // Group I
  france:        { fifaRank: 3,  worldCupAppearances: 16, wcWins: 34, wcDraws: 14, wcLosses: 14, wcGoalsFor: 120, wcGoalsAgainst: 68,  bestFinish: "Champions (×2)" },
  senegal:       { fifaRank: 19, worldCupAppearances: 3,  wcWins: 4,  wcDraws: 3,  wcLosses: 3,  wcGoalsFor: 11,  wcGoalsAgainst: 10,  bestFinish: "QF (2002)" },
  norway:        { fifaRank: 29, worldCupAppearances: 3,  wcWins: 2,  wcDraws: 3,  wcLosses: 4,  wcGoalsFor: 7,   wcGoalsAgainst: 8,   bestFinish: "QF (1938)" },
  iraq:          { fifaRank: 58, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 0,  wcLosses: 6,  wcGoalsFor: 4,   wcGoalsAgainst: 22,  bestFinish: "Group Stage" },
  // Group J
  argentina:     { fifaRank: 2,  worldCupAppearances: 18, wcWins: 45, wcDraws: 14, wcLosses: 16, wcGoalsFor: 145, wcGoalsAgainst: 76,  bestFinish: "Champions (×3)" },
  austria:       { fifaRank: 24, worldCupAppearances: 7,  wcWins: 12, wcDraws: 5,  wcLosses: 13, wcGoalsFor: 49,  wcGoalsAgainst: 55,  bestFinish: "3rd (1954)" },
  algeria:       { fifaRank: 35, worldCupAppearances: 4,  wcWins: 3,  wcDraws: 3,  wcLosses: 7,  wcGoalsFor: 13,  wcGoalsAgainst: 21,  bestFinish: "R16 (2014)" },
  jordan:        { fifaRank: 66, worldCupAppearances: 0,  wcWins: 0,  wcDraws: 0,  wcLosses: 0,  wcGoalsFor: 0,   wcGoalsAgainst: 0,   bestFinish: "Debut 2026" },
  // Group K
  portugal:      { fifaRank: 6,  worldCupAppearances: 9,  wcWins: 17, wcDraws: 7,  wcLosses: 9,  wcGoalsFor: 62,  wcGoalsAgainst: 41,  bestFinish: "3rd (1966)" },
  colombia:      { fifaRank: 13, worldCupAppearances: 6,  wcWins: 9,  wcDraws: 5,  wcLosses: 9,  wcGoalsFor: 32,  wcGoalsAgainst: 28,  bestFinish: "QF (2014)" },
  uzbekistan:    { fifaRank: 50, worldCupAppearances: 0,  wcWins: 0,  wcDraws: 0,  wcLosses: 0,  wcGoalsFor: 0,   wcGoalsAgainst: 0,   bestFinish: "Debut 2026" },
  drcongo:       { fifaRank: 56, worldCupAppearances: 1,  wcWins: 0,  wcDraws: 1,  wcLosses: 2,  wcGoalsFor: 4,   wcGoalsAgainst: 14,  bestFinish: "Group Stage (1974)" },
  // Group L
  england:       { fifaRank: 4,  worldCupAppearances: 16, wcWins: 28, wcDraws: 18, wcLosses: 16, wcGoalsFor: 87,  wcGoalsAgainst: 53,  bestFinish: "Champions (1966)" },
  croatia:       { fifaRank: 10, worldCupAppearances: 6,  wcWins: 14, wcDraws: 4,  wcLosses: 8,  wcGoalsFor: 46,  wcGoalsAgainst: 32,  bestFinish: "2nd (2018)" },
  panama:        { fifaRank: 30, worldCupAppearances: 2,  wcWins: 0,  wcDraws: 1,  wcLosses: 5,  wcGoalsFor: 4,   wcGoalsAgainst: 14,  bestFinish: "Group Stage" },
  ghana:         { fifaRank: 72, worldCupAppearances: 4,  wcWins: 4,  wcDraws: 4,  wcLosses: 6,  wcGoalsFor: 13,  wcGoalsAgainst: 23,  bestFinish: "QF (2010)" },
}

export const mockProvider: DataProvider = {
  getMatches() {
    return [...matches, ...knockoutMatches]
  },
  getMatch(id: string) {
    return [...matches, ...knockoutMatches].find(m => m.id === id) ?? null
  },
  getGroups() {
    const groupIds = ["A","B","C","D","E","F","G","H","I","J","K","L"]
    return groupIds.map(gid => ({
      id: gid,
      teams: Object.values(teams).filter(t => t.group === gid),
      matches: matches.filter(m => m.group === gid),
    }))
  },
  getStandings() {
    const result: Record<string, Standing[]> = {}
    for (const gid of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
      result[gid] = computeStandings(gid)
    }
    return result
  },
  getBracket,
  getTeam(id: string) {
    return teams[id] ?? null
  },
  getTeamStats(teamId: string) {
    return teamStats[teamId] ?? null
  },
}



