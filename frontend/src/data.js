export const SITE = {
  name: 'Surkanda Devi Ropeway',
  company: 'Surkanda Devi Ropeway Project Pvt. Ltd.',
  phone: '+91 98710 04053',
  phoneRaw: '919871004053',
  email: 'info@surkandadevi.com',
  address: 'Kaddukhal, Dhanaulti, Tehri Garhwal, Uttarakhand – 249145',
  hours: '7:00 AM – 5:00 PM',
  gstin: '05AASCS5830P1ZL',
  youtube: 'https://youtu.be/nwMNP24f7xY',
  youtubeEmbed: 'https://www.youtube.com/embed/nwMNP24f7xY',
  facebook: 'https://www.facebook.com/share/r/1D3RQicFAv/',
  instagram: 'https://www.instagram.com/reel/De80lhNE7Xy/?utm_source=ig_web_copy_link&xtok=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA==',
  price: 225,
  base: 214.28,
  gst: 5.36,
}

export const IMG = (n) => `/images/${n}.webp`

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/ropeway', label: 'Ropeway' },
  { to: '/temple', label: 'The Temple' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/plan-your-visit', label: 'Plan Your Visit' },
  { to: '/contact', label: 'Contact' },
]

export const FEATURES = [
  { icon: 'clock', title: '5-Minute Journey', text: 'A climb that once took nearly two hours on foot now takes just five minutes in a comfortable cabin.' },
  { icon: 'shield', title: 'Safety First', text: 'Modern safety systems, trained operators and regular inspections on every single run.' },
  { icon: 'mountain', title: 'Himalayan Views', text: 'Glide above pine forests with sweeping views of the Garhwal Himalayas all the way up.' },
  { icon: 'users', title: 'For Every Age', text: 'Elderly pilgrims, families with children and differently-abled devotees can all reach the temple with ease.' },
  { icon: 'sun', title: 'Year-Round Darshan', text: 'Reach the temple in any season, with operating hours adjusted for summer and winter.' },
  { icon: 'ticket', title: 'Simple Booking', text: 'Book online in under a minute, carry your e-ticket and walk straight to the counter.' },
]

export const STEPS = [
  { n: '01', title: 'Book Your Ticket', text: 'Choose your date and number of tickets on our booking page.' },
  { n: '02', title: 'Reach Kaddukhal', text: 'Drive to the ropeway base station on the Mussoorie–Chamba road.' },
  { n: '03', title: 'Ride the Ropeway', text: 'Show your e-ticket and ID, then enjoy a 5-minute scenic ride.' },
  { n: '04', title: 'Seek Darshan', text: 'A short walk from the upper station brings you to Ma Surkanda Devi.' },
]

export const FAQS = [
  { q: 'How long is the ropeway ride?', a: 'The ride covers 502 metres from Kaddukhal towards the temple summit and takes about 5 minutes each way.' },
  { q: 'What is the ticket price?', a: 'A ticket costs ₹225 per person, inclusive of GST, and covers a two-way ride for the selected date.' },
  { q: 'What should I carry?', a: 'Please carry a valid photo ID and show your e-ticket (on your phone or printed) at the counter.' },
  { q: 'What are the operating hours?', a: 'Summer (Apr–Oct): 7:00 AM – 6:00 PM. Winter (Nov–Mar): 8:00 AM – 5:00 PM. Timings may change with weather conditions.' },
  { q: 'Is the ropeway suitable for senior citizens and children?', a: 'Yes. The ropeway is designed for all age groups and makes the temple accessible to elderly and differently-abled pilgrims.' },
  { q: 'Why is Surkanda Devi called a Shakti Peeth?', a: 'According to tradition, the head (sir) of Goddess Sati fell on this hill, which is why it was first called Sirkhanda and later Surkanda. It is counted among the 51 Shakti Peethas.' },
  { q: 'What is the best time to visit Surkanda Devi?', a: 'March to June and September to November offer clear skies and pleasant weather. Visit around Ganga Dussehra or Navratri for the fairs, and in winter (Dec–Feb) for snow, with warm clothing.' },
  { q: 'What prasad is given at the temple?', a: 'Devotees traditionally receive leaves of the Rautela plant as prasad, which are believed to carry healing properties and bring good fortune.' },
  { q: 'What else can I visit nearby?', a: 'Dhanaulti Eco Park, Kanatal, Chamba, Mussoorie and the Tehri Lake are all within easy reach, and the Shakti Peeth temples of Kunjapuri and Chandrabadani make a perfect pilgrimage circuit.' },
  { q: 'Is the ropeway open in bad weather?', a: 'For safety, operations may be paused during strong winds, storms or heavy snow. Please call us on the day of travel if the weather looks uncertain.' },
]

export const GALLERY = [
  { src: 'temple-front', cap: 'Ma Surkanda Devi Temple', cat: 'Temple' },
  { src: 'hero-mountains', cap: 'Morning light over the Garhwal ranges', cat: 'Himalayas' },
  { src: 'cabin-blue-big', cap: 'Ropeway cabins at the station', cat: 'Ropeway' },
  { src: 'temple-gate', cap: 'The gateway on the path to the temple', cat: 'Temple' },
  { src: 'cabin-yellow-big', cap: 'Yellow cabins amid the deodar forest', cat: 'Ropeway' },
  { src: 'mountains-3', cap: 'Layers of misty ridges', cat: 'Himalayas' },
  { src: 'temple-side', cap: 'The shrine adorned with marigold garlands', cat: 'Temple' },
  { src: 'cabin-blue', cap: 'Cabins ready for departure', cat: 'Ropeway' },
  { src: 'mountains-2', cap: 'Sunrise haze in the valley', cat: 'Himalayas' },
  { src: 'temple-top', cap: 'The tiered roof of the sanctum', cat: 'Temple' },
  { src: 'cabins-blue-line', cap: 'Cabins climbing the line', cat: 'Ropeway' },
  { src: 'cabin-yellow-tower', cap: 'A cabin passing a support tower', cat: 'Ropeway' },
  { src: 'temple-crowd', cap: 'Devotees at the temple courtyard', cat: 'Temple' },
  { src: 'tower-view', cap: 'High above Kaddukhal', cat: 'Ropeway' },
  { src: 'mountains-4', cap: 'Himalayan haze at golden hour', cat: 'Himalayas' },
  { src: 'temple-gate2', cap: 'Steps leading up to the shrine', cat: 'Temple' },
]

export const LEGEND = [
  { n: '01', title: 'The Yajna of King Daksha', text: 'Sati, daughter of King Daksha, married Lord Shiva against her father’s wishes. When Daksha held a grand yajna and did not invite Shiva, Sati went anyway and could not bear the insult to her husband.' },
  { n: '02', title: 'The Sacrifice of Sati', text: 'Unable to bear the disrespect, Sati gave up her life in the sacred fire. Heartbroken and furious, Lord Shiva lifted her body and began the cosmic dance of destruction, the Tandav.' },
  { n: '03', title: 'The Chakra of Vishnu', text: 'To calm Shiva and save the universe, Lord Vishnu released his Sudarshan Chakra, which divided Sati’s body into parts. Wherever they fell, a Shakti Peeth was born.' },
  { n: '04', title: 'Where the Head Fell', text: 'On this very ridge at 2,756 metres, the head of Sati is said to have fallen. The hill became known as Sirkhanda, and over time, Surkanda, the abode of the Goddess.' },
]

export const FESTIVALS = [
  { when: 'May – June', title: 'Ganga Dussehra', text: 'The biggest celebration of the year. Thousands of devotees climb to the temple for a grand fair, special puja and bhajan-kirtan, as the whole mountain echoes with the Goddess’s name.' },
  { when: 'March – April & Sept – Oct', title: 'Navratri', text: 'Nine nights of devotion in Chaitra and Sharad Navratri. The shrine is decorated with fresh flowers and devotees come to offer prayers, especially on Ashtami.' },
  { when: 'Dec – Feb', title: 'Winter Darshan', text: 'Snow often blankets the summit in winter, turning the temple and the surrounding deodar forest into a quiet, magical scene. Warm clothing is a must.' },
]

export const NEARBY = [
  { img: 'mountains-2', cat: 'Hill Station', title: 'Dhanaulti & Eco Park', dist: 'Approx. 8–10 km', text: 'A calm hill town wrapped in deodar, pine and rhododendron forest. Walk the Eco Park trails, enjoy a cup of tea in the mist and watch the sun set over the ridges.' },
  { img: 'mountains-3', cat: 'Hill Station', title: 'Kanatal', dist: 'Approx. 10–12 km', text: 'A peaceful village for nature lovers, known for apple orchards, camping and sweeping Himalayan views. Ideal for a slow, relaxing break after darshan.' },
  { img: 'mountains-4', cat: 'Town', title: 'Chamba', dist: 'Approx. 20 km', text: 'A gateway town on the Rishikesh–Gangotri route, famous for its green terraced fields, fresh mountain produce and a gentle view of the Tehri region.' },
  { img: 'tower-view', cat: 'Lake & Adventure', title: 'Tehri Lake', dist: 'Approx. 1.5 hr drive', text: 'One of Asia’s largest man-made reservoirs. Enjoy boating, water sports and the vast blue lake framed by the Garhwal mountains.' },
  { img: 'hero-mountains', cat: 'Queen of Hills', title: 'Mussoorie', dist: 'Approx. 1–1.5 hr drive', text: 'The classic Himalayan hill station with Mall Road, Kempty Falls, Gun Hill and cafés. An easy add-on to your Surkanda trip.' },
]

export const TEMPLES_NEARBY = [
  { img: 'temple-gate', title: 'Kunjapuri Devi Temple', tag: 'Shakti Peeth', dist: 'Approx. 2.5–3 hr drive', text: 'Another of the 51 Shakti Peethas, near Narendranagar. Reach the hilltop at sunrise to see the first light touch the Himalayan peaks and the Ganga valley.' },
  { img: 'temple-side', title: 'Chandrabadani Temple', tag: 'Shakti Peeth', dist: 'Approx. 2.5–3 hr drive', text: 'A serene Shakti Peeth in Tehri Garhwal on a ridge surrounded by forest, where the Goddess is worshipped as Chandrabadani.' },
  { img: 'temple-top', title: 'Jwalaji Temple, Benog Hill', tag: 'Mussoorie', dist: 'Approx. 1–1.5 hr drive', text: 'A quiet hilltop temple in Mussoorie’s Benog forest, reached by a gentle trek and popular for its peaceful setting and tranquil views.' },
]
