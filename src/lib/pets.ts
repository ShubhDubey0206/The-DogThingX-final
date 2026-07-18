export interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat" | "bird" | "fish" | "small-pet";
  breed: string;
  age: string;
  ageGroup: "baby" | "young" | "adult" | "senior";
  gender: "male" | "female";
  size: "small" | "medium" | "large" | "n/a";
  weight?: string;
  color: string;
  vaccinated: boolean;
  neutered?: boolean;
  status: "available" | "reserved" | "adopted";
  adoptionFee: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  description: string;
  traits: string[];
  image: string;
}

export const PETS: Pet[] = [
  { id:"p01", name:"Bruno", species:"dog", breed:"Labrador Retriever", age:"2 years", ageGroup:"young", gender:"male", size:"large", weight:"28kg", color:"Golden", vaccinated:true, neutered:false, status:"available", adoptionFee:5000, rating:4.8, reviewCount:32, description:"Friendly and energetic lab, great with kids.", traits:["Playful","Kid-friendly","House-trained","Loves fetch"], image:"https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80" },
  { id:"p02", name:"Luna", species:"cat", breed:"Persian", age:"1 year", ageGroup:"young", gender:"female", size:"small", weight:"3.5kg", color:"White", vaccinated:true, neutered:true, status:"available", adoptionFee:3500, rating:4.9, reviewCount:18, isNew:true, description:"Gentle, lap-loving Persian who adores cuddles.", traits:["Calm","Indoor cat","Affectionate","Low maintenance"], image:"https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?w=400&q=80" },
  { id:"p03", name:"Tweety", species:"bird", breed:"Budgerigar", age:"6 months", ageGroup:"baby", gender:"male", size:"n/a", weight:"35g", color:"Green & Yellow", vaccinated:false, status:"available", adoptionFee:800, rating:4.5, reviewCount:12, isNew:true, description:"Cheerful budgie, already mimics simple words.", traits:["Talkative","Colourful","Easy care","Beginner-friendly"], image:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80" },
  { id:"p04", name:"Nemo", species:"fish", breed:"Clownfish", age:"4 months", ageGroup:"baby", gender:"male", size:"n/a", color:"Orange & White", vaccinated:false, status:"available", adoptionFee:600, rating:4.6, reviewCount:8, description:"Vibrant clownfish, healthy and eating well.", traits:["Low maintenance","Peaceful","Colourful","Tank-ready"], image:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80" },
  { id:"p05", name:"Max", species:"dog", breed:"German Shepherd", age:"3 years", ageGroup:"adult", gender:"male", size:"large", weight:"32kg", color:"Black & Tan", vaccinated:true, neutered:false, status:"reserved", adoptionFee:8000, rating:4.7, reviewCount:41, description:"Loyal and intelligent GSD, trained basic commands.", traits:["Loyal","Trainable","Alert","Needs exercise"], image:"https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80" },
  { id:"p06", name:"Mochi", species:"cat", breed:"Scottish Fold", age:"8 months", ageGroup:"baby", gender:"female", size:"small", weight:"2.8kg", color:"Grey Tabby", vaccinated:true, neutered:false, status:"available", adoptionFee:6000, rating:5.0, reviewCount:6, isNew:true, description:"Adorable folded-ear kitten, very social.", traits:["Social","Playful","Apartment-friendly","Quiet"], image:"https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80" },
  { id:"p07", name:"Sunny", species:"bird", breed:"Cockatiel", age:"1 year", ageGroup:"young", gender:"female", size:"n/a", weight:"90g", color:"Yellow & Grey", vaccinated:false, status:"available", adoptionFee:1500, rating:4.4, reviewCount:9, description:"Affectionate cockatiel who loves head scratches.", traits:["Gentle","Whistles tunes","Handleable","Bonding"], image:"https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80" },
  { id:"p08", name:"Rocky", species:"dog", breed:"Beagle", age:"5 months", ageGroup:"baby", gender:"male", size:"medium", weight:"6kg", color:"Tricolor", vaccinated:true, neutered:false, status:"available", adoptionFee:4000, rating:4.8, reviewCount:22, isNew:true, description:"Curious and gentle beagle puppy, very playful.", traits:["Curious","Family dog","Energetic","Loves walks"], image:"https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80" },
  { id:"p09", name:"Goldie", species:"fish", breed:"Goldfish", age:"3 months", ageGroup:"baby", gender:"female", size:"n/a", color:"Gold & Orange", vaccinated:false, status:"available", adoptionFee:200, rating:4.2, reviewCount:5, description:"Classic fancy goldfish, healthy and active.", traits:["Peaceful","Easy care","Decorative","Beginner-friendly"], image:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80" },
  { id:"p10", name:"Bella", species:"dog", breed:"Golden Retriever", age:"4 years", ageGroup:"adult", gender:"female", size:"large", weight:"27kg", color:"Golden", vaccinated:true, neutered:true, status:"available", adoptionFee:0, rating:4.9, reviewCount:37, description:"Sweet rescue golden, house-trained, loves children.", traits:["Rescue","Gentle","House-trained","Kid-friendly"], image:"https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80" },
  { id:"p11", name:"Coco", species:"dog", breed:"Pomeranian", age:"1 year", ageGroup:"young", gender:"female", size:"small", weight:"3kg", color:"Brown", vaccinated:true, neutered:false, status:"available", adoptionFee:12000, rating:4.9, reviewCount:14, isNew:true, description:"Fluffy and energetic Pom, loves attention and cuddles.", traits:["Fluffy","Energetic","Apartment-friendly","Kid-safe"], image:"https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=80" },
  { id:"p12", name:"Shadow", species:"cat", breed:"Bombay", age:"2 years", ageGroup:"young", gender:"male", size:"medium", weight:"4kg", color:"Jet Black", vaccinated:true, neutered:true, status:"available", adoptionFee:2500, rating:4.7, reviewCount:9, description:"Sleek all-black Bombay, very affectionate and curious.", traits:["Curious","Affectionate","Indoor","Sleek"], image:"https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80" },
  { id:"p13", name:"Rio", species:"bird", breed:"Lovebird", age:"7 months", ageGroup:"baby", gender:"male", size:"n/a", weight:"55g", color:"Green & Red", vaccinated:false, status:"available", adoptionFee:1200, rating:4.6, reviewCount:7, isNew:true, description:"Vibrant lovebird, pairs well and loves interaction.", traits:["Social","Colourful","Active","Pairs well"], image:"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80" },
  { id:"p14", name:"Hammy", species:"small-pet", breed:"Syrian Hamster", age:"2 months", ageGroup:"baby", gender:"female", size:"small", weight:"100g", color:"Golden Brown", vaccinated:false, status:"available", adoptionFee:400, rating:4.3, reviewCount:11, description:"Cute and active Syrian hamster, perfect starter pet.", traits:["Beginner-friendly","Nocturnal","Easy care","Curious"], image:"https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80" },
  { id:"p15", name:"Guppy Pack (6)", species:"fish", breed:"Fancy Guppy", age:"3 months", ageGroup:"baby", gender:"male", size:"n/a", color:"Rainbow", vaccinated:false, status:"available", adoptionFee:500, rating:4.5, reviewCount:19, description:"A pack of 6 colourful fancy guppies, bred locally.", traits:["Peaceful","Colourful","Easy care","Hardy"], image:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80" },
];
