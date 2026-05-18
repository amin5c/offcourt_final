// =============================================
// products.js — Product Data & Card Builder
// =============================================
// PRODUCTS is an array (list) of objects.
// Each object = one sneaker with its details.
// cardHTML() builds the HTML for one product card.
// =============================================

var PRODUCTS = [
  { id:"1",  name:"Cloud Stratus Elite",     brand:"On",           cat:"running",    price:289, old:null, rating:4.8, reviews:342,  img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",  badge:"new",  feat:true  },
  { id:"2",  name:"UltraBoost 24",           brand:"Adidas",       cat:"running",    price:220, old:280,  rating:4.9, reviews:1205, img:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",  badge:"sale", feat:false },
  { id:"3",  name:"Vaporfly Next%",          brand:"Nike",         cat:"running",    price:275, old:null, rating:4.7, reviews:892,  img:"https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",  badge:"new",  feat:true  },
  { id:"4",  name:"Fresh Foam X 1080v13",    brand:"New Balance",  cat:"running",    price:185, old:null, rating:4.6, reviews:567,  img:"https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80",  badge:null,   feat:false },
  { id:"5",  name:"Gel-Kayano 30",           brand:"ASICS",        cat:"running",    price:195, old:230,  rating:4.5, reviews:423,  img:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",  badge:"sale", feat:false },
  { id:"6",  name:"Air Force 1 '07 Premium", brand:"Nike",         cat:"casual",     price:145, old:null, rating:4.9, reviews:2341, img:"https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80",  badge:null,   feat:true  },
  { id:"7",  name:"Stan Smith Lux",          brand:"Adidas",       cat:"casual",     price:165, old:null, rating:4.7, reviews:1876, img:"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",  badge:null,   feat:false },
  { id:"8",  name:"550 Heritage",            brand:"New Balance",  cat:"casual",     price:150, old:180,  rating:4.8, reviews:987,  img:"https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600&q=80",  badge:"sale", feat:true  },
  { id:"9",  name:"Old Skool Premium",       brand:"Vans",         cat:"casual",     price:95,  old:null, rating:4.6, reviews:1543, img:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",  badge:null,   feat:false },
  { id:"10", name:"Chuck 70 Hi",             brand:"Converse",     cat:"casual",     price:110, old:null, rating:4.5, reviews:2109, img:"https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80",  badge:null,   feat:false },
  { id:"11", name:"LeBron XXI",              brand:"Nike",         cat:"basketball", price:225, old:null, rating:4.8, reviews:654,  img:"https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&q=80",  badge:"new",  feat:true  },
  { id:"12", name:"Curry 11",                brand:"Under Armour", cat:"basketball", price:180, old:null, rating:4.7, reviews:432,  img:"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",  badge:null,   feat:false },
  { id:"13", name:"Harden Vol. 8",           brand:"Adidas",       cat:"basketball", price:165, old:200,  rating:4.6, reviews:321,  img:"https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80",  badge:"sale", feat:false },
  { id:"14", name:"KD 16",                   brand:"Nike",         cat:"basketball", price:195, old:null, rating:4.7, reviews:287,  img:"https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=80",  badge:null,   feat:false },
  { id:"15", name:"Ja 2",                    brand:"Nike",         cat:"basketball", price:135, old:null, rating:4.5, reviews:543,  img:"https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80",  badge:null,   feat:false },
  { id:"16", name:"Yeezy 350 V2",            brand:"Adidas",       cat:"lifestyle",  price:290, old:null, rating:4.8, reviews:1876, img:"https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80",  badge:"new",  feat:true  },
  { id:"17", name:"Forum 84 Low",            brand:"Adidas",       cat:"lifestyle",  price:140, old:null, rating:4.6, reviews:654,  img:"https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80",  badge:null,   feat:false },
  { id:"18", name:"Dunk Low Retro",          brand:"Nike",         cat:"lifestyle",  price:125, old:155,  rating:4.9, reviews:3241, img:"https://images.unsplash.com/photo-1612902456551-333ac5afa26e?w=600&q=80",  badge:"sale", feat:true  },
  { id:"19", name:"990v6",                   brand:"New Balance",  cat:"lifestyle",  price:215, old:null, rating:4.8, reviews:876,  img:"https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600&q=80",  badge:null,   feat:false },
  { id:"20", name:"Gel-1130",                brand:"ASICS",        cat:"lifestyle",  price:140, old:170,  rating:4.7, reviews:543,  img:"https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&q=80",  badge:"sale", feat:false },
  { id:"21", name:"Air Jordan 1 Retro OG",   brand:"Jordan",       cat:"limited",    price:380, old:null, rating:5.0, reviews:2341, img:"https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80",  badge:"lim",  feat:true  },
  { id:"22", name:"Travis Scott x AJ4",      brand:"Jordan",       cat:"limited",    price:450, old:null, rating:4.9, reviews:432,  img:"https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80",  badge:"lim",  feat:false },
  { id:"23", name:"Off-White x Dunk Low",    brand:"Nike",         cat:"limited",    price:520, old:null, rating:4.9, reviews:287,  img:"https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80",  badge:"lim",  feat:false },
  { id:"24", name:"sacai x LDWaffle",        brand:"Nike",         cat:"limited",    price:340, old:null, rating:4.8, reviews:321,  img:"https://images.unsplash.com/photo-1613230485186-2e7e0fca1253?w=600&q=80",  badge:"lim",  feat:false },
  { id:"25", name:"Fear of God Athletics",   brand:"Adidas",       cat:"limited",    price:295, old:null, rating:4.7, reviews:198,  img:"https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&q=80",  badge:"lim",  feat:false },
  { id:"26", name:"Endorphin Pro 4",         brand:"Saucony",      cat:"running",    price:265, old:null, rating:4.7, reviews:234,  img:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",  badge:null,   feat:false },
  { id:"27", name:"Cloudmonster",            brand:"On",           cat:"running",    price:210, old:250,  rating:4.6, reviews:456,  img:"https://images.unsplash.com/photo-1668922378165-0c9bfedb50df?w=600&q=80",  badge:"sale", feat:false },
  { id:"28", name:"Gazelle Indoor",          brand:"Adidas",       cat:"casual",     price:120, old:null, rating:4.8, reviews:1234, img:"https://images.unsplash.com/photo-1514989940723-e8e51d675571?w=600&q=80",  badge:null,   feat:false },
  { id:"29", name:"Air Max 90",              brand:"Nike",         cat:"casual",     price:155, old:185,  rating:4.7, reviews:2341, img:"https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",  badge:"sale", feat:false },
  { id:"30", name:"Samba OG",               brand:"Adidas",       cat:"casual",     price:120, old:null, rating:4.9, reviews:3456, img:"https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=600&q=80",  badge:null,   feat:true  }
];

// ── STAR RATING builder ───────────────────────
// Turns 4.8 into ★★★★☆
function starHTML(rating) {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += i <= Math.floor(rating) ? '★' : '☆';
  }
  return stars;
}

// ── CARD HTML builder ─────────────────────────
// Takes one product object and returns HTML string for a card
// delay = animation stagger so cards fade in one by one
function cardHTML(p, delay) {
  // Badge (New / Sale / Limited)
  var badge = '';
  if (p.badge === 'new')  badge = '<span class="pc-badge b-new">New</span>';
  if (p.badge === 'sale') badge = '<span class="pc-badge b-sale">Sale</span>';
  if (p.badge === 'lim')  badge = '<span class="pc-badge b-lim">Limited</span>';

  // Strikethrough original price (only if on sale)
  var oldPrice = p.old ? '<span class="pc-old">$' + p.old + '</span>' : '';

  // Capitalize first letter of category
  var cat = p.cat.charAt(0).toUpperCase() + p.cat.slice(1);

  return (
    '<div class="pc" style="animation-delay:' + (delay || 0) + 's">' +
      '<div class="pc-img">' + badge +
        '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80\'" />' +
      '</div>' +
      '<div class="pc-body">' +
        '<div class="pc-brand">' + p.brand + '</div>' +
        '<div class="pc-name">'  + p.name  + '</div>' +
        '<div class="pc-cat">'   + cat     + '</div>' +
        '<div class="pc-stars">' + starHTML(p.rating) + ' <span>(' + p.reviews + ')</span></div>' +
        '<div class="pc-foot">' +
          '<div><span class="pc-price">$' + p.price + '</span>' + oldPrice + '</div>' +
          '<button class="pc-add" onclick="addCart(\'' + p.id + '\', event)">Add +</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}
