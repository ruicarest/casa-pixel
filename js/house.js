// Fração I (T3B) — Passeio da Quinta do Sol, redrawn from the "planta tipo" at roughly 0.5 m per tile.
// Orientation matches the plan with the stair core at the top: bedrooms on the right, living room bottom-left.
// To change the house: edit MAP (one character = one 16px tile), ROOMS and defaultObjects().
//
// Legend:  ' ' outside / wall thickness      d doorway in a back wall
//   floors: t pale tile (despensa)   p parquet   S dark slate (kitchen, laundry)   g dark grey plank tile (bathrooms)   v balcony stone
//   back walls: G painted light grey   C small cream tiles   L large light-grey tiles
//   (w wood boards, k checker and B brick still exist in the tile set but are no longer used)

// Bump when MAP or defaultObjects() change: saved furniture positions are then replaced by the new defaults
// (plants and their watering history are kept when the page is synced with the cloud).
export const LAYOUT = 12;

export const MAP = [
  '                             ',
  '                     GGGGGGG ',
  '                  GG GGGGGGG ',
  ' CC CCCCCCC GGdGG GG ppppppp ',
  ' CC CCCCCCC GGdGG tt ppppppp ',
  ' SS SSSSSSS pppppptt ppppppp ',
  ' SS SSSSSSS ppppp    ppppppp ',
  ' SSSSSSSSSS pppppppppppGGGGG ',
  ' SS SSSSSSSppppppppp GGGGGGG ',
  ' GG GGGGGGGGd LLL pp GGppppp ',
  ' GG GGGGGGGGd LLL pp ppppppp ',
  ' vv ppppppppp ggggpp ppppppp ',
  ' vv ppppppppp ggg pppppppppp ',
  ' vv ppppppppp ggg pp GGGGGGG ',
  ' vvpppppppppp LLL pp GGGGGGG ',
  ' vvpppppppppp LLLppppppppppp ',
  ' vv ppppppppp gggg   ppppppp ',
  ' vv ppppppppp gggggg ppppppp ',
  ' vv ppppppppp gggggg ppppppp ',
  '                             ',
];

// Tile rectangles, used to say which room a plant is in.
export const ROOMS = [
  { name: 'Lavandaria', x: 1, y: 5, w: 2, h: 4 },
  { name: 'Cozinha', x: 3, y: 5, w: 8, h: 4 },
  { name: 'Despensa', x: 18, y: 4, w: 2, h: 2 },
  { name: 'Entrada', x: 11, y: 5, w: 7, h: 4 },
  { name: 'Corredor', x: 17, y: 7, w: 3, h: 9 },
  { name: 'Varanda', x: 1, y: 11, w: 2, h: 8 },
  { name: 'Sala', x: 3, y: 11, w: 10, h: 8 },
  { name: 'Casa de banho de serviço', x: 14, y: 11, w: 3, h: 3 },
  { name: 'Casa de banho', x: 14, y: 16, w: 3, h: 3 },
  { name: 'Casa de banho', x: 17, y: 16, w: 3, h: 3 }, // the recess under the end of the corridor, where the shower is
  { name: 'Closet', x: 20, y: 3, w: 8, h: 4 },
  { name: 'Closet', x: 20, y: 7, w: 3, h: 1 }, // the nook by its door, which cuts a corner out of the escritório
  { name: 'Escritório', x: 20, y: 9, w: 8, h: 4 },
  { name: 'Quarto', x: 20, y: 15, w: 8, h: 4 },
];

export const fmtDate = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const ago = n => { const d = new Date(); d.setDate(d.getDate() - n); return fmtDate(d); };

const plant = (name, species, intervalDays, wateredDaysAgo) => ({
  name, species, intervalDays, lastWatered: ago(wateredDaysAgo), history: [ago(wateredDaysAgo)],
});

// One object on the map holding several plants.
const group = (name, list) => ({ name, plants: list.map((p, i) => ({ id: `${name}-${i}`, ...p })) });

// x / y are in tiles (top-left corner of the sprite); fractions are allowed.
// Every room follows photos taken from its door. Plant names and watering intervals are first guesses
// from those photos, and "last watered" starts as the day the page is first opened.
export function defaultObjects() {
  const list = [
    // Lavandaria
    ['lav_shelf', 1.06, 3.2], ['washer', 2, 4], ['mop', 1.2, 4.6], ['drying_rack', 1, 6.2], ['laundry_basket', 1.1, 7.9],
    // Cozinha — worktop on the back wall: fridge at the laundry end, free worktop left of the sink, oven at the far right
    ['k_upper', 5, 3.1], ['k_upper', 8, 3.1],
    ['fridge', 4, 3.5], ['k_cab', 5, 4], ['k_sink', 6, 4], ['k_dish', 7, 4], ['k_drawers', 8, 4], ['k_cab', 9, 4], ['k_oven', 10, 4],
    ['runner_grey', 5.4, 5.55], ['runner_grey', 8.2, 5.55],
    ['litter', 4.2, 8.3], ['bin_yellow', 5.6, 8.3], ['k_cart', 6.5, 7.25], ['bowls', 9.6, 8.4],
    // Entrada — front door at the top; the console stands against the cut-away front wall, by the sala door.
    // The kitchen door is at the bottom of the hall's left wall. The despensa is its own small room, top-right.
    ['mat', 13.5, 5], ['picture', 15.3, 3.3], ['console', 13.7, 7.45],
    ['pantry_shelves', 18.06, 2.5], ['vacuum', 18.2, 5.1],
    // Sala — the sofa wall is the back wall; the TV wall is the cut-away front wall, so the TV shows its back
    ['wall_shelves', 4.2, 9.3], ['picture_elephant', 7.3, 9.2], ['picture_antelope', 8.7, 9.4],
    ['niche_shelves', 10.4, 9],
    ['pothos', 10.75, 9, plant('Jiboia', 'Epipremnum aureum', 7, 0)],
    ['sofa_grey', 6.35, 10.4],
    ['plant_tables', 4, 11.6, group('Mesas da janela', [
      plant('Alocásia', 'Alocasia zebrina', 7, 0), plant('Planta jovem', 'por identificar', 7, 0),
      plant('Lírio-da-paz', 'Spathiphyllum', 5, 0), plant('Dracena', 'Dracaena fragrans', 10, 0),
      plant('Palmeira-de-salão', 'Chamaedorea elegans', 7, 0), plant('Eufórbia', 'Euphorbia', 21, 0),
      plant('Suculenta', 'por identificar', 14, 0),
    ])],
    ['rug_shag', 5.5, 14.5],
    ['dining_table', 10.6, 13.3], ['calathea', 11, 13.15, plant('Maranta riscada', 'Ctenanthe burle-marxii', 5, 0)],
    ['chair_dark', 11.15, 12.5], ['chair_dark_b', 11.15, 15], ['chair_dark_l', 9.95, 13.7], ['chair_dark_r', 12.25, 13.7],
    ['cabinet_black_side', 4.03, 16.1], ['beanbag', 5, 16.7],
    ['tv_south', 5.8, 17.55], ['zz', 8.1, 16.7, plant('Zamioculca', 'Zamioculcas zamiifolia', 21, 0)],
    ['console_glass', 9.2, 17.85], ['floor_lamp', 10.8, 16.8],
    ['fatsia', 11.65, 17.3, plant('Fátsia', 'Fatsia japonica', 5, 0)],
    // Varanda
    ['balcony_pots', 1.05, 11.2, group('Vasos da varanda', [
      plant('Arbusto pequeno', 'por identificar', 4, 0), plant('Floreira com canas', 'por identificar', 4, 0),
      plant('Vaso branco', 'por identificar', 4, 0),
    ])],
    ['rail_planter', 1.05, 13.4, plant('Floreira do corrimão', 'Espada-de-são-jorge e sedum', 14, 0)],
    ['bistro_set', 1.06, 16],
    // Casa de banho de serviço — basin on the left wall (its mirror hangs on that wall, which neither view shows), corner shower
    ['vanity_side', 14.03, 10.55], ['rug_peach', 15.6, 11.5], ['shower', 14, 13], ['toilet', 16, 12.6],
    // Casa de banho — basin and tower on the left wall; toilet, bin and basket along the cut-away front wall;
    // the walk-in shower is in the recess at the bottom right (where the plan shows a bathtub)
    ['bath_tower', 14.05, 14.55], ['vanity_side', 14.03, 15.75],
    ['toilet', 14.15, 17.7], ['bin_steel', 15.3, 18.4], ['wicker_basket', 15.9, 18.2],
    ['rug_navy', 16.9, 17.6], ['shower_glass_v', 18.95, 17.2],
    // Closet — L-shaped: the door opens into a nook at the bottom-left; window on the right wall
    ['window_side', 28, 3.5],
    ['clothes_rack', 21, 1.4], ['dresser_white', 23.3, 1.3], ['dehumidifier', 24.8, 2.6], ['storage_box', 25.6, 2.9],
    ['armchair_black', 26.6, 2.3], ['ironing_board', 25.2, 3.9],
    ['desk', 25.5, 5.3], ['office_chair_black', 24.4, 5.5],
    // Escritório — door bottom-left, window on the right wall
    ['window_side', 28, 9.5],
    ['picture', 23.3, 7.5], ['picture', 24.6, 7.5], ['picture', 25.9, 7.5],
    ['ladder', 21, 9], ['dresser_dark', 21, 10.3],
    ['sign', 23, 8.5], ['whiteboard', 24, 8.5], ['mat_dark', 23, 9.5], ['stool', 23, 10.5],
    ['kallax_side', 27, 8.5], ['desk_side', 26.5, 11], ['office_chair', 25.5, 11.5],
    ['cabinet_dark', 24, 10.5],
    ['cat', 27.125, 9.5625], // asleep on its bed, on top of the low shelf
    // Quarto — door top-left, built-in white wardrobe along the left wall below it, window on the right wall
    ['window_side', 28, 15.5],
    ['picture', 22.5, 13.5], ['heater', 21, 14.5], ['ladder', 26, 13.5], ['basket', 27, 14.5],
    ['wardrobe_side', 21.03, 15.37], ['rug_grey', 22.1, 15.6], ['bed_sage', 23.5, 16],
    ['nightstand', 22.5, 18], ['nightstand_lamp', 26, 18],
  ];
  return list.map(([type, x, y, extra], i) => ({
    id: `o${i}`, type, x, y,
    ...(extra ? (extra.plants ? extra : { plant: extra }) : {}),
  }));
}
