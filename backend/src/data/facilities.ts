import { Facility } from '../types';

export const facilities: Facility[] = [
    {
        id: 1,
        name: "Omsk Refinery (Gazprom Neft)",
        location: { latitude: 54.9885, longitude: 73.3242 },
        capacity: 395000,
        type: "refinery",
        hit: false
    },
    {
        id: 2,
        name: "Samara Refinery (Rosneft)",
        location: { latitude: 53.2001, longitude: 50.15 },
        capacity: 265000,
        type: "refinery",
        hit: false
    },
    {
        id: 3,
        name: "Ufa Refinery (Rosneft)",
        location: { latitude: 54.7388, longitude: 55.9721 },
        capacity: 295000,
        type: "refinery",
        hit: false
    },
    {
        id: 4,
        name: "Surgut Oil Field",
        location: { latitude: 61.25, longitude: 73.4167 },
        capacity: 500000,
        type: "extraction",
        hit: false
    },
    {
        id: 5,
        name: "Nizhnevartovsk Oil Terminal",
        location: { latitude: 60.9347, longitude: 76.5531 },
        capacity: 150000,
        type: "storage",
        hit: false
    },
    {
        id: 6,
        name: "Yaroslavl Refinery",
        location: { latitude: 57.6261, longitude: 39.8845 },
        capacity: 320000,
        type: "refinery",
        hit: false
    },
    {
        id: 7,
        name: "Khanty-Mansiysk Oil Field",
        location: { latitude: 61.0042, longitude: 69.0019 },
        capacity: 450000,
        type: "extraction",
        hit: false
    },
    {
        id: 8,
        name: "Moscow Refinery",
        location: { latitude: 55.7558, longitude: 37.6173 },
        capacity: 180000,
        type: "refinery",
        hit: false
    },
    {
        id: 9,
        name: "Nizhnekamsk Refinery",
        location: { latitude: 55.6364, longitude: 51.8151 },
        capacity: 240000,
        type: "refinery",
        hit: true
    },
    {
        id: 10,
        name: "Achinsk Refinery (Rosneft)",
        location: { latitude: 56.2694, longitude: 90.4993 },
        capacity: 165000,
        type: "refinery",
        hit: true
    },
    {
        id: 11,
        name: "Novokuibyshevsk Refinery (Rosneft)",
        location: { latitude: 53.0975, longitude: 49.9500 },
        capacity: 235000,
        type: "refinery",
        hit: true
    },
    {
        id: 12,
        name: "Volgograd Refinery (Lukoil)",
        location: { latitude: 48.7194, longitude: 44.5018 },
        capacity: 280000,
        type: "refinery",
        hit: true
    },
    {
        id: 13,
        name: "Astrakhan Refinery",
        location: { latitude: 46.3497, longitude: 48.0408 },
        capacity: 160000,
        type: "refinery",
        hit: false
    },
    {
        id: 14,
        name: "Saratov Refinery (Rosneft)",
        location: { latitude: 51.5334, longitude: 46.0344 },
        capacity: 225000,
        type: "refinery",
        hit: false
    },
    {
        id: 15,
        name: "Krasnoyarsk Refinery (Rosneft)",
        location: { latitude: 56.0153, longitude: 92.8932 },
        capacity: 205000,
        type: "refinery",
        hit: false
    },
    {
        id: 16,
        name: "Ukhta Refinery (Lukoil)",
        location: { latitude: 63.5672, longitude: 53.6968 },
        capacity: 155000,
        type: "refinery",
        hit: false
    },
    {
        id: 17,
        name: "Belgorod Refinery",
        location: { latitude: 50.5950, longitude: 36.5872 },
        capacity: 130000,
        type: "refinery",
        hit: false
    },
    {
        id: 18,
        name: "Ryazan Refinery",
        location: { latitude: 54.6269, longitude: 39.6916 },
        capacity: 290000,
        type: "refinery",
        hit: false
    },
    {
        id: 19,
        name: "Smolensk Refinery",
        location: { latitude: 54.7818, longitude: 32.0401 },
        capacity: 120000,
        type: "refinery",
        hit: false
    },
    {
        id: 20,
        name: "Murom Refinery",
        location: { latitude: 55.5753, longitude: 42.0418 },
        capacity: 110000,
        type: "refinery",
        hit: false
    },
    {
        id: 21,
        name: "St. Petersburg Refinery",
        location: { latitude: 59.9311, longitude: 30.3609 },
        capacity: 240000,
        type: "refinery",
        hit: false
    },
    {
        id: 22,
        name: "Syzran Refinery (Rosneft)",
        location: { latitude: 53.1586, longitude: 48.4686 },
        capacity: 215000,
        type: "refinery",
        hit: false
    },
    {
        id: 23,
        name: "Tobolsk Refinery",
        location: { latitude: 58.1979, longitude: 68.2545 },
        capacity: 310000,
        type: "refinery",
        hit: false
    },
    {
        id: 24,
        name: "Tuimazy Refinery",
        location: { latitude: 54.6061, longitude: 53.7022 },
        capacity: 170000,
        type: "refinery",
        hit: false
    },
    {
        id: 25,
        name: "Kuytun Refinery",
        location: { latitude: 54.3444, longitude: 101.5083 },
        capacity: 90000,
        type: "refinery",
        hit: false
    },
    {
        id: 26,
        name: "Krasnodar Refinery",
        location: { latitude: 45.0355, longitude: 38.9753 },
        capacity: 180000,
        type: "refinery",
        hit: false
    },
    {
        id: 27,
        name: "Arkhangelsk Refinery",
        location: { latitude: 64.5401, longitude: 40.5433 },
        capacity: 100000,
        type: "refinery",
        hit: false
    },
    {
        id: 28,
        name: "Novy Urengoy Refinery",
        location: { latitude: 66.0833, longitude: 76.6800 },
        capacity: 220000,
        type: "refinery",
        hit: false
    },
    {
        id: 29,
        name: "Pskov Refinery",
        location: { latitude: 57.8136, longitude: 28.3496 },
        capacity: 95000,
        type: "refinery",
        hit: false
    },
    {
        id: 30,
        name: "Voronezh Refinery",
        location: { latitude: 51.6720, longitude: 39.1843 },
        capacity: 160000,
        type: "refinery",
        hit: false
    },
    {
        id: 31,
        name: "Gusinoozersk Refinery",
        location: { latitude: 51.2842, longitude: 106.5181 },
        capacity: 85000,
        type: "refinery",
        hit: false
    },
    {
        id: 32,
        name: "Syktyvkar Refinery",
        location: { latitude: 61.6681, longitude: 50.8369 },
        capacity: 125000,
        type: "refinery",
        hit: false
    },
    {
        id: 33,
        name: "Nizhny Novgorod Refinery (Lukoil)",
        location: { latitude: 56.2965, longitude: 43.9361 },
        capacity: 265000,
        type: "refinery",
        hit: false
    },
    {
        id: 34,
        name: "Komsomolsk Refinery (Rosneft)",
        location: { latitude: 50.5500, longitude: 137.0167 },
        capacity: 215000,
        type: "refinery",
        hit: false
    },
    {
        id: 35,
        name: "Cherdyn Refinery",
        location: { latitude: 60.4014, longitude: 56.4797 },
        capacity: 75000,
        type: "refinery",
        hit: false
    },
    {
        id: 36,
        name: "Cherkessk Refinery",
        location: { latitude: 44.2236, longitude: 42.0581 },
        capacity: 110000,
        type: "refinery",
        hit: false
    },
    {
        id: 37,
        name: "Nefteyugansk Refinery",
        location: { latitude: 61.0992, longitude: 72.6139 },
        capacity: 190000,
        type: "refinery",
        hit: false
    },
    {
        id: 38,
        name: "Kstovo Refinery",
        location: { latitude: 56.1500, longitude: 44.2000 },
        capacity: 310000,
        type: "refinery",
        hit: false
    },
    {
        id: 39,
        name: "Angarsk Refinery (Rosneft)",
        location: { latitude: 52.5333, longitude: 103.8833 },
        capacity: 275000,
        type: "refinery",
        hit: false
    },
    {
        id: 40,
        name: "Orsk Refinery",
        location: { latitude: 51.2044, longitude: 58.4750 },
        capacity: 210000,
        type: "refinery",
        hit: false
    },
    {
        id: 41,
        name: "Perm Refinery (Lukoil)",
        location: { latitude: 58.0297, longitude: 56.2667 },
        capacity: 245000,
        type: "refinery",
        hit: false
    },
    {
        id: 42,
        name: "Tutaev Refinery",
        location: { latitude: 57.8786, longitude: 39.5389 },
        capacity: 140000,
        type: "refinery",
        hit: false
    },
    {
        id: 43,
        name: "Salavat Refinery",
        location: { latitude: 53.3610, longitude: 55.9239 },
        capacity: 270000,
        type: "refinery",
        hit: false
    },
    {
        id: 44,
        name: "Anzhero-Sudzhensk Refinery",
        location: { latitude: 56.0811, longitude: 86.0294 },
        capacity: 95000,
        type: "refinery",
        hit: false
    },
    {
        id: 45,
        name: "Argun Refinery",
        location: { latitude: 43.2922, longitude: 45.8686 },
        capacity: 80000,
        type: "refinery",
        hit: false
    },
    {
        id: 46,
        name: "Afipsky Refinery",
        location: { latitude: 44.9031, longitude: 38.8636 },
        capacity: 130000,
        type: "refinery",
        hit: false
    },
    {
        id: 47,
        name: "Sergiev Posad Refinery",
        location: { latitude: 56.3000, longitude: 38.1333 },
        capacity: 105000,
        type: "refinery",
        hit: false
    },
    {
        id: 48,
        name: "Seversk Refinery",
        location: { latitude: 56.6006, longitude: 84.8561 },
        capacity: 115000,
        type: "refinery",
        hit: false
    },
    {
        id: 49,
        name: "Yermolaevo Refinery",
        location: { latitude: 54.5156, longitude: 73.1058 },
        capacity: 70000,
        type: "refinery",
        hit: false
    },
    {
        id: 50,
        name: "Grozny Refinery",
        location: { latitude: 43.3125, longitude: 45.6986 },
        capacity: 160000,
        type: "refinery",
        hit: false
    },
    {
        id: 51,
        name: "Chelyabinsk Refinery",
        location: { latitude: 55.1644, longitude: 61.4368 },
        capacity: 195000,
        type: "refinery",
        hit: false
    },
    {
        id: 52,
        name: "Kirov Refinery",
        location: { latitude: 58.6035, longitude: 49.6680 },
        capacity: 135000,
        type: "refinery",
        hit: false
    },
    {
        id: 53,
        name: "Murmansk Refinery",
        location: { latitude: 68.9585, longitude: 33.0827 },
        capacity: 125000,
        type: "refinery",
        hit: false
    },
    {
        id: 54,
        name: "Sterlitamak Refinery",
        location: { latitude: 53.6247, longitude: 55.9508 },
        capacity: 175000,
        type: "refinery",
        hit: false
    },
    {
        id: 55,
        name: "Ulyanovsk Refinery",
        location: { latitude: 54.3142, longitude: 48.4031 },
        capacity: 155000,
        type: "refinery",
        hit: false
    },
    {
        id: 56,
        name: "Kamensk-Uralsky Refinery",
        location: { latitude: 56.4183, longitude: 61.9342 },
        capacity: 145000,
        type: "refinery",
        hit: false
    },
    {
        id: 57,
        name: "Lensk Refinery",
        location: { latitude: 60.7250, longitude: 114.9167 },
        capacity: 90000,
        type: "refinery",
        hit: false
    },
    {
        id: 58,
        name: "Chersk Refinery",
        location: { latitude: 62.5833, longitude: 161.3333 },
        capacity: 65000,
        type: "refinery",
        hit: false
    },
    {
        id: 59,
        name: "Bryansk Refinery",
        location: { latitude: 53.2521, longitude: 34.3717 },
        capacity: 110000,
        type: "refinery",
        hit: false
    },
    {
        id: 60,
        name: "Pavlodar Refinery",
        location: { latitude: 52.2978, longitude: 76.9514 },
        capacity: 180000,
        type: "refinery",
        hit: false
    },
    {
        id: 61,
        name: "Khabarovsk Refinery (Rosneft)",
        location: { latitude: 48.4827, longitude: 135.0838 },
        capacity: 230000,
        type: "refinery",
        hit: false
    },
    {
        id: 62,
        name: "Tver Refinery",
        location: { latitude: 56.8584, longitude: 35.9176 },
        capacity: 125000,
        type: "refinery",
        hit: false
    },
    {
        id: 63,
        name: "Togliatti Refinery",
        location: { latitude: 53.5303, longitude: 49.3461 },
        capacity: 245000,
        type: "refinery",
        hit: false
    },
    {
        id: 64,
        name: "Cherepovets Refinery",
        location: { latitude: 59.1333, longitude: 37.9000 },
        capacity: 165000,
        type: "refinery",
        hit: false
    },
    {
        id: 65,
        name: "Yugorsk Refinery",
        location: { latitude: 61.3086, longitude: 63.3361 },
        capacity: 105000,
        type: "refinery",
        hit: false
    },
    {
        id: 66,
        name: "Stavropol Refinery",
        location: { latitude: 45.0428, longitude: 41.9692 },
        capacity: 135000,
        type: "refinery",
        hit: false
    },
    {
        id: 67,
        name: "Glazov Refinery",
        location: { latitude: 58.1394, longitude: 52.6581 },
        capacity: 95000,
        type: "refinery",
        hit: false
    },
    {
        id: 68,
        name: "Kirishi Refinery",
        location: { latitude: 59.4486, longitude: 32.0228 },
        capacity: 310000,
        type: "refinery",
        hit: false
    },
    {
        id: 69,
        name: "Kemerovo Refinery",
        location: { latitude: 55.3547, longitude: 86.0872 },
        capacity: 175000,
        type: "refinery",
        hit: false
    },
    {
        id: 70,
        name: "Kaluga Refinery",
        location: { latitude: 54.5293, longitude: 36.2754 },
        capacity: 120000,
        type: "refinery",
        hit: false
    },
    {
        id: 71,
        name: "Magadan Refinery",
        location: { latitude: 59.5636, longitude: 150.8083 },
        capacity: 85000,
        type: "refinery",
        hit: false
    },
    {
        id: 72,
        name: "Noyabrsk Refinery",
        location: { latitude: 63.1983, longitude: 75.4514 },
        capacity: 155000,
        type: "refinery",
        hit: false
    },
    {
        id: 73,
        name: "Ivanovo Refinery",
        location: { latitude: 57.0000, longitude: 40.9736 },
        capacity: 100000,
        type: "refinery",
        hit: false
    },
    {
        id: 74,
        name: "Yuzhno-Sakhalinsk Refinery",
        location: { latitude: 46.9514, longitude: 142.7361 },
        capacity: 115000,
        type: "refinery",
        hit: false
    },
    {
        id: 75,
        name: "Penza Refinery",
        location: { latitude: 53.1950, longitude: 45.0183 },
        capacity: 140000,
        type: "refinery",
        hit: false
    },
    {
        id: 76,
        name: "Tuapse Refinery (Rosneft)",
        location: { latitude: 44.1008, longitude: 39.0744 },
        capacity: 235000,
        type: "refinery",
        hit: false
    },
    {
        id: 77,
        name: "Irkutsk Refinery",
        location: { latitude: 52.2869, longitude: 104.2811 },
        capacity: 185000,
        type: "refinery",
        hit: false
    },
    {
        id: 78,
        name: "Antipinsky Refinery",
        location: { latitude: 57.1411, longitude: 65.5344 },
        capacity: 195000,
        type: "refinery",
        hit: false
    }
];
