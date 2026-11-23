const studio = '/experience/byeveriart/';
const films = studio + 'films/';
const reels = 'https://pub-22c601fc38564ec79d41e018bfad6bcf.r2.dev/';

// Only these destinations can become links in a Peaches response.
export const destinations = {
  films: ['Explore the film portfolio', films],
  works: ['ByEveriArt selected works', studio + '#selected-works'],
  deadly: ['Deadly Pursuit · crew and production stills', films + 'deadly-pursuit/'],
  excerpt: ['Play the 34-second rough-cut excerpt', '/assets/deadly-pursuit/excerpt.mp4'],
  programme: ['U & US · captioned film and photographs', films + 'u-and-us/'],
  short: ['Play the 31-second U & US short', '/assets/you-and-us/film.mp4'],
  postcards: ['View the nine Sokoto postcards', films + 'sokoto/'],
  argungu: ['Argungu Fishing Festival · documentary credits', films + '#argungu'],
  homa: ['Homa (The Net) · related short on YouTube', 'https://www.youtube.com/watch?v=P66ZIpQIxms'],
  gumel: ['Gumel Documentary · production credits', films + '#gumel'],
  highlight: ['Gumel · official highlight on YouTube', 'https://www.youtube.com/watch?v=g9exVt_daOI'],
  hope: ['Hope for Her · project', '/work/hope-for-her/'],
  hopeReel: ['Play the Hope for Her reel', reels + 'hope-for-her/reel.mp4'],
  regalia: ['Regalia Pop Up Events · project and cuts', '/work/regalia-pop-up-events/'],
  regaliaReel: ['Play the Regalia event reel', reels + 'regalia-pop-up-events/reel.mp4'],
  studios: ['Explore the three studios', '/experience/'],
  design: ['EveriDesign', '/experience/everidesign/'],
  photography: ['BeFrames', '/experience/beframes/'],
  house: ['Meet the house', '/about/#people'],
  linkedin: ['David Wivina on LinkedIn', 'https://ng.linkedin.com/in/everiart'],
  instagram: ['ByEveriArt on Instagram', 'https://www.instagram.com/byeveriart/'],
  designInstagram: ['EveriDesign on Instagram', 'https://www.instagram.com/everidesign/'],
  site: ['Everiart website', '/'],
  contact: ['Contact Everiart', '/contact/'],
  whatsapp: ['WhatsApp the studio', 'https://wa.me/2348121210795'],
  email: ['Email the house', 'mailto:hello@everiart.com']
};

const entry = (match, reply, linkIds) => ({ match, reply, linkIds });
export const guide = {
  deadly: entry(/deadly pursuit|profect original|ambrose|john chris|bobo ezii|quinet|rash boheiman|cynthia obadan|nwokoro/i,
    'Deadly Pursuit is a Profect Original Film in collaboration with ByEveriArt. ByEveriArt and Ambrose Oseni are credited as executive producers. Ambrose Profect directed and produced the film, and John Chris is credited as producer.\n\nQuinet wrote the script, Rash Boheiman edited the script, Bobo Ezii led cinematography, John F. Nwokoro edited the film and Cynthia Obadan managed production. The full-scale Nollywood crime thriller used a full set, vehicles, assistant directors, camera operators and a dedicated sound team. The public 34-second excerpt is from the work in progress.',
    ['deadly','excerpt']),
  programme: entry(/\bu\s*(?:&|and|n|\+)\s*us\b|you (?:and|&) us|julius holland|aysha clothier/i,
    'U & US is a programme by Julius Holland and The Aysha Clothier. ByEveriArt documented it with an eight-person on-site media crew responsible for all photography, documentary cinematography, logistics and procurement. The 31-second film brings together voices from the workshop and has English captions in the case-study player. The Day 1, 5 and 7 photographs follow the work from the workshop table through cloth and patterns to the finished garments.',
    ['programme','short']),
  sokoto: entry(/sokoto|malpai|\bidp\b|displaced people|moving postcards/i,
    'A Visit to an IDP Camp in Sokoto is a ByEveriArt project with Malpai Foundation. Nine silent moving postcards document a camp for internally displaced people in Sokoto, Nigeria. Open the story and choose Next to move through it at your own pace.',
    ['postcards']),
  argungu: entry(/argungu|fishing festival|\bhoma\b/i,
    'For Argungu Fishing Festival, ByEveriArt handled production logistics and procurement, cinematography and most of post-production in collaboration with Perfecto Movies. The public video is Homa (The Net), a related short from Perfecto Movies’ festival series about the fishing tradition.',
    ['argungu','homa']),
  gumel: entry(/gumel/i,
    'The Gumel Emirate commissioned the documentary marking the Emir’s 45th anniversary on the throne. ByEveriArt organised the shoot logistics and procurement, handled cinematography and completed most of post-production in collaboration with Perfecto Movies. Perfecto Movies’ official highlight is available to watch.',
    ['gumel','highlight']),
  hope: entry(/hope for her/i,
    'Hope for Her is part of ByEveriArt’s foundation documentary work. You can watch the published reel or explore the project page.', ['hope','hopeReel']),
  regalia: entry(/regalia|pop[ -]?up event/i,
    'Regalia Pop Up Events is a ByEveriArt event film. Its public portfolio includes the project reel and two short cuts.', ['regalia','regaliaReel']),
  international: entry(/abroad|international|overseas|foreign|outside nigeria|where.{0,30}(filmed|shot|shoot|worked)|other countries|government agenc|\bngos?\b/i,
    'All Everiart productions to date have been filmed in Nigeria. The house has worked in Nigeria with international clients, government agencies and NGOs. U & US is one public example of work for an international programme. For a proposed shoot abroad, tell the team the location and scope so they can discuss what it would take.',
    ['programme','contact']),
  leaders: entry(/leadership|managing director|creative director|\bmd\b|david wivina|ibrahim|cine magic|linkedin|who (?:leads|runs)/i,
    'David Wivina is Managing Director of Everiart Creative House in Abuja. Ibrahim Abdulwahab is Creative Director of ByEveriArt and is affiliated with Cine Magic. Their profiles and portraits are on Meet the House.', ['house','linkedin']),
  partners: entry(/collaborators?|partners?|profect visuals|perfecto movies/i,
    'The house lists Perfecto Movies, Cine Magic and Profect Visuals as studio collaborators. ByEveriArt’s documentary collaboration with Perfecto Movies includes Argungu Fishing Festival and the Gumel Documentary. Ibrahim Abdulwahab, ByEveriArt’s Creative Director, is affiliated with Cine Magic.',
    ['house','argungu','gumel']),
  capacity: entry(/capacity|(?:crew|team) size|how (?:big|large|many)|scale of (?:work|production)/i,
    'For Deadly Pursuit, ByEveriArt shared executive producer credit on a full-scale Nollywood production with a full set, vehicles, assistant directors, camera operators and a dedicated sound team. For U & US, ByEveriArt fielded eight people for photography, documentary cinematography, logistics and procurement. The team can discuss crew size for your brief.',
    ['deadly','programme','contact']),
  stills: entry(/photos?|photographs?|stills|behind the scenes/i,
    'The U & US case study shows ByEveriArt’s workshop photographs from Days 1, 5 and 7. The Deadly Pursuit case study includes production stills of the office set, camera and lighting setups, and a performer between setups. For portrait, event and brand photography, explore BeFrames.', ['programme','deadly','photography']),
  movie: entry(/\b(?:movie|feature film|full[- ]length|nollywood|make a film|produce a film|film production)\b/i,
    'Yes. ByEveriArt produces full-length movies. On Deadly Pursuit, a Profect Original Film, the studio served as an executive producer alongside Ambrose Oseni. The production had a full set, vehicles and dedicated camera and sound crews. The case study includes the crew credits, on-set photographs and a 34-second work-in-progress excerpt.', ['deadly','excerpt','films']),
  watch: entry(/\bwatch\b|viewing|reels?|portfolio|samples?|released films?|examples of (?:films?|work)|documentaries|documentary work/i,
    'Start with the 34-second Deadly Pursuit work-in-progress excerpt or the captioned U & US workshop short. The film portfolio also includes the nine Sokoto postcards, a related Argungu festival short, the official Gumel highlight, the Hope for Her reel and Regalia event cuts.', ['films','excerpt','programme','postcards','homa','highlight']),
  social: entry(/socials?|instagram|website/i,
    'You can find the house at everiart.com, ByEveriArt and EveriDesign on Instagram, and David Wivina on LinkedIn.', ['site','instagram','designInstagram','linkedin']),
  contact: entry(/contact|whatsapp|email|address|located|reach (you|the team)|where are you based/i,
    'Everiart Creative House is at 170 Ademola Adetokunbo, Wuse 2, Abuja, Nigeria. Send a brief to hello@everiart.com, use the contact form or reach the studio on WhatsApp.', ['contact','email','whatsapp']),
  services: entry(/services|categories|studios?|byeveriart|what (?:can|do) you (?:do|offer)|event films?|cinematography|videography|everidesign|beframes/i,
    'ByEveriArt is the house’s full-service media production studio for full-length film production, cinematography, videography and photography. Its Selected Works are grouped under Movie Production, Documentaries and Event Films. EveriDesign creates brand identities, art direction and visual systems. BeFrames specialises in portrait, event and brand photography.', ['works','design','photography'])
};

const projectKeys = ['deadly','programme','sokoto','argungu','gumel','hope','regalia'];
const curated = (reply, linkIds) => ({reply, linkIds, projectSlugs: [], suggestions: [], mode: 'guide'});

export function requestsRestrictedDetails(text) {
  return /largest (?:credit|production|budget|project)|biggest (?:film|budget|project)|screener|full (?:release|copy)|private (?:files?|budget|commission)|raw (?:footage|files?|archive)|shooting script|(?:budget|cost).{0,30}(?:deadly|spent|figure|amount)|(?:deadly pursuit|production).{0,25}(?:budget|cost)|how much did.{0,45}(?:cost|spend)/i.test(text);
}

export function portfolioAnswer(messages) {
  const text = messages.at(-1)?.content ?? '';
  if (requestsRestrictedDetails(text))
    return curated('The public portfolio documents production roles and scale. Deadly Pursuit had a substantial production budget. Financial figures and confidential commissions are private. The available viewing material includes a 34-second work-in-progress excerpt. For screening availability or a reference for a particular scale of work, please contact the team.', ['deadly','excerpt','contact']);

  // Creative briefs go to the conversational service. A factual lookup works independently.
  if (/help me (?:plan|develop|write|shape|think)|how should|our (?:brand|foundation) (?:needs|has)|for my (?:film|brand|brief)|similar approach|brainstorm/i.test(text)) return null;
  let keys = projectKeys.filter(key => guide[key].match.test(text));
  if (!keys.length && /^(?:and |so )?(?:who|what|where|how|can i|show me|is there|tell me more).{0,55}\b(?:it|its|that (?:project|film)|the crew|the director)\b/i.test(text)) {
    const previous = messages.slice(0,-1).filter(m=>m.role==='user').at(-1)?.content ?? '';
    keys = projectKeys.filter(key=>guide[key].match.test(previous));
  }
  if (!keys.length) {
    const general = ['international','leaders','partners','capacity','social','contact','stills','movie','watch','services'];
    const key = general.find(key=>guide[key].match.test(text));
    if (key) keys = [key];
  }
  if (!keys.length) return null;
  if (keys.length === 1 && guide.international.match.test(text) && projectKeys.includes(keys[0])) keys.push('international');
  const topics = keys.map(key=>guide[key]);
  return curated(topics.map(t=>t.reply).join('\n\n'), [...new Set(topics.flatMap(t=>t.linkIds))]);
}

export function offlineGuide(messages) {
  return portfolioAnswer(messages) ?? curated('The creative chat is temporarily unavailable. You can still explore the public film portfolio, meet the studios or bring your brief directly to the team.', ['films','studios','contact']);
}
