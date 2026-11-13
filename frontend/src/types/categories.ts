export interface ProductCategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  hint: string;
  examples: string[];
}

export const PRODUCT_CATEGORIES: ProductCategoryInfo[] = [
  {
    id: 'clothing',
    name: 'Clothing & Apparel',
    icon: 'Shirt',
    description: 'Dresses, shirts, kurtas, jackets',
    hint: 'Specify your body measurements (bust, waist, hip) and the exact garment',
    examples: ['Black dress size M', 'Silk wrap dress', 'Cotton kurta size 40']
  },
  {
    id: 'electronics_accessory',
    name: 'Electronics & Accessories',
    icon: 'Cpu',
    description: 'Printer cartridges, TV mounts, vacuum filters, cables',
    hint: 'Specify your device model number (e.g. HP DeskJet 2331, Dyson V11, TV model)',
    examples: ['Printer cartridge for HP DeskJet 2331', 'TV wall mount for 55 inch TV', 'Filter for Dyson vacuum']
  },
  {
    id: 'furniture',
    name: 'Furniture & Living',
    icon: 'Armchair',
    description: 'Sofas, dining tables, wardrobes, shelving',
    hint: 'Specify your doorway width and room dimensions to verify clearance',
    examples: ['Sofa that fits through an 80 cm door', '3-seater fabric sofa', '6-seater dining table']
  },
  {
    id: 'grocery_pharmacy',
    name: 'Grocery & Pharmacy',
    icon: 'Pill',
    description: 'OTC medicines, dietary foods, supplements',
    hint: 'Specify your dietary requirements (gluten-free, allergen-free) or health concern',
    examples: ['Gluten-free biscuits nearby', 'Crocin Advance paracetamol', 'Lactose-free oat milk']
  },
  {
    id: 'footwear',
    name: 'Footwear & Athletic',
    icon: 'Footprints',
    description: 'Running shoes, boots, formal leather shoes',
    hint: 'Specify your foot length in cm/inches or UK/US shoe size',
    examples: ['SprintPro running shoes size 9', 'Hiking boots for wide feet']
  },
  {
    id: 'hardware',
    name: 'Hardware & Tools',
    icon: 'Wrench',
    description: 'Wall anchors, bolts, shelf brackets, masonry screws',
    hint: 'Specify wall substrate (drywall, brick, concrete) and load weight',
    examples: ['M8 anchor bolt for concrete', 'Heavy-duty shelf brackets']
  }
];
