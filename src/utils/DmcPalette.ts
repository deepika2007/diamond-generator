export interface DmcColor {
  code: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

// A curated collection of the most common and structurally diverse standard DMC colors.
// This database covers the full visual spectrum of red, pink, orange, yellow, green, blue, purple, brown, grey, black, and white.
export const DMC_COLORS: DmcColor[] = [
  // Reds / Pinks
  { code: "310", name: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
  { code: "B5200", name: "Snow White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  { code: "3865", name: "Winter White", hex: "#F9F6EE", r: 249, g: 246, b: 238 },
  { code: "666", name: "Bright Red", hex: "#E31D42", r: 227, g: 29, b: 66 },
  { code: "321", name: "Red", hex: "#C72B3B", r: 199, g: 43, b: 59 },
  { code: "817", name: "Very Dark Coral Red", hex: "#B7051F", r: 183, g: 5, b: 31 },
  { code: "498", name: "Dark Red", hex: "#A61026", r: 166, g: 16, b: 38 },
  { code: "815", name: "Medium Garnet", hex: "#8A1728", r: 138, g: 23, b: 40 },
  { code: "150", name: "Dusty Rose Ultra Dark", hex: "#9E1235", r: 158, g: 18, b: 53 },
  { code: "3687", name: "Mauve Dark", hex: "#C65A76", r: 198, g: 90, b: 118 },
  { code: "3689", name: "Mauve Light", hex: "#F5C3CE", r: 245, g: 195, b: 206 },
  { code: "3713", name: "Salmon Very Light", hex: "#FFE2E2", r: 255, g: 226, b: 226 },
  { code: "3705", name: "Melon Dark", hex: "#FF7B8E", r: 255, g: 123, b: 142 },
  { code: "3801", name: "Melon Very Dark", hex: "#E73D54", r: 231, g: 61, b: 84 },
  { code: "3831", name: "Raspberry Dark", hex: "#B62D4A", r: 182, g: 45, b: 74 },
  
  // Oranges
  { code: "606", name: "Bright Red-Orange", hex: "#FF3300", r: 255, g: 51, b: 0 },
  { code: "740", name: "Tangerine", hex: "#FF7E00", r: 255, g: 126, b: 0 },
  { code: "741", name: "Medium Tangerine", hex: "#FFA300", r: 255, g: 163, b: 0 },
  { code: "742", name: "Light Tangerine", hex: "#FFBE3B", r: 255, g: 190, b: 59 },
  { code: "946", name: "Burnt Orange Dark", hex: "#E04F00", r: 224, g: 79, b: 0 },
  { code: "947", name: "Burnt Orange", hex: "#FF7B4D", r: 255, g: 123, b: 77 },
  { code: "3825", name: "Pale Apricot", hex: "#FCD2B1", r: 252, g: 210, b: 177 },
  { code: "3853", name: "Autumn Gold Dark", hex: "#D88448", r: 216, g: 132, b: 72 },
  { code: "3854", name: "Autumn Gold Medium", hex: "#EAA76C", r: 234, g: 167, b: 108 },
  { code: "3855", name: "Autumn Gold Light", hex: "#F5C798", r: 245, g: 199, b: 152 },

  // Yellows
  { code: "307", name: "Lemon", hex: "#FFEB00", r: 255, g: 235, b: 0 },
  { code: "444", name: "Dark Lemon", hex: "#FFD300", r: 255, g: 211, b: 0 },
  { code: "725", name: "Topaz Medium Light", hex: "#FFC840", r: 255, g: 200, b: 64 },
  { code: "726", name: "Topaz Light", hex: "#FFE575", r: 255, g: 229, b: 117 },
  { code: "727", name: "Topaz Very Light", hex: "#FFF3A8", r: 255, g: 243, b: 168 },
  { code: "743", name: "Yellow Medium", hex: "#FCD464", r: 252, g: 212, b: 100 },
  { code: "744", name: "Yellow Pale", hex: "#FFE899", r: 255, g: 232, b: 153 },
  { code: "745", name: "Yellow Pale Light", hex: "#FFF2C4", r: 255, g: 242, b: 196 },
  { code: "973", name: "Bright Canary Yellow", hex: "#FFE700", r: 255, g: 231, b: 0 },
  { code: "3820", name: "Straw Dark", hex: "#DFB15B", r: 223, g: 177, b: 91 },
  { code: "3822", name: "Straw Light", hex: "#EED492", r: 238, g: 212, b: 146 },

  // Greens
  { code: "319", name: "Pistachio Green Shadow Dark", hex: "#1A522A", r: 26, g: 82, b: 42 },
  { code: "320", name: "Pistachio Green Medium", hex: "#639E6D", r: 99, g: 158, b: 109 },
  { code: "367", name: "Pistachio Green Dark", hex: "#326E3F", r: 50, g: 110, b: 63 },
  { code: "368", name: "Pistachio Green Light", hex: "#8FBFA2", r: 143, g: 191, b: 162 },
  { code: "699", name: "Christmas Green", hex: "#007A29", r: 0, g: 122, b: 41 },
  { code: "700", name: "Bright Green", hex: "#008B30", r: 0, g: 139, b: 48 },
  { code: "701", name: "Light Christmas Green", hex: "#39B54A", r: 57, g: 181, b: 74 },
  { code: "702", name: "Kelly Green", hex: "#00A859", r: 0, g: 168, b: 89 },
  { code: "703", name: "Chartreuse", hex: "#7CC542", r: 124, g: 197, b: 66 },
  { code: "704", name: "Bright Chartreuse", hex: "#A8D85B", r: 168, g: 216, b: 91 },
  { code: "904", name: "Very Dark Parrot Green", hex: "#226B18", r: 34, g: 107, b: 24 },
  { code: "905", name: "Dark Parrot Green", hex: "#3C8D23", r: 60, g: 141, b: 35 },
  { code: "906", name: "Medium Parrot Green", hex: "#56AC2B", r: 86, g: 172, b: 43 },
  { code: "907", name: "Light Parrot Green", hex: "#8DC93E", r: 141, g: 201, b: 62 },
  { code: "912", name: "Emerald Green Light", hex: "#179B75", r: 23, g: 155, b: 117 },
  { code: "913", name: "Emerald Green Medium", hex: "#45B28F", r: 69, g: 178, b: 143 },
  { code: "986", name: "Forest Green Very Dark", hex: "#134224", r: 19, g: 66, b: 36 },
  { code: "987", name: "Forest Green Dark", hex: "#32623D", r: 50, g: 98, b: 61 },
  { code: "988", name: "Forest Green Medium", hex: "#5C8C67", r: 92, g: 140, b: 103 },
  { code: "989", name: "Forest Green Light", hex: "#87B291", r: 135, g: 178, b: 145 },
  { code: "3818", name: "Emerald Green Ultra Dark", hex: "#00553A", r: 0, g: 85, b: 58 },

  // Teals / Turquoises
  { code: "3808", name: "Turquoise Ultra Dark", hex: "#004754", r: 0, g: 71, b: 84 },
  { code: "3809", name: "Turquoise Very Dark", hex: "#006275", r: 0, g: 98, b: 117 },
  { code: "3810", name: "Turquoise Dark", hex: "#008199", r: 0, g: 129, b: 153 },
  { code: "3811", name: "Turquoise Very Light", hex: "#A8E5EC", r: 168, g: 229, b: 236 },
  { code: "597", name: "Turquoise Medium", hex: "#55A6B8", r: 85, g: 166, b: 184 },
  { code: "598", name: "Turquoise Light", hex: "#95D1DC", r: 149, g: 209, b: 220 },
  { code: "807", name: "Peacock Blue", hex: "#298F9A", r: 41, g: 143, b: 154 },
  { code: "958", name: "Seagreen Dark", hex: "#36A18C", r: 54, g: 161, b: 140 },
  { code: "959", name: "Seagreen Medium", hex: "#59C1AB", r: 89, g: 193, b: 171 },
  { code: "964", name: "Seagreen Light", hex: "#A6E1D7", r: 166, g: 225, b: 215 },

  // Blues
  { code: "312", name: "Baby Blue Very Dark", hex: "#1A3D63", r: 26, g: 61, b: 99 },
  { code: "334", name: "Baby Blue Medium", hex: "#6D99C6", r: 109, g: 153, b: 198 },
  { code: "336", name: "Navy Blue Inside Dark", hex: "#132D56", r: 19, g: 45, b: 86 },
  { code: "796", name: "Royal Blue Dark", hex: "#11416D", r: 17, g: 65, b: 109 },
  { code: "797", name: "Royal Blue", hex: "#164D81", r: 22, g: 77, b: 129 },
  { code: "798", name: "Delft Blue Dark", hex: "#456A8F", r: 69, g: 106, b: 143 },
  { code: "799", name: "Delft Blue Medium", hex: "#6A8CAE", r: 106, g: 140, b: 174 },
  { code: "800", name: "Delft Blue Pale", hex: "#C5D3E3", r: 197, g: 211, b: 227 },
  { code: "803", name: "Baby Blue Ultra Dark", hex: "#184973", r: 24, g: 73, b: 115 },
  { code: "809", name: "Delft Blue Light", hex: "#8DA7C5", r: 141, g: 167, b: 197 },
  { code: "813", name: "Light Blue", hex: "#A0BEDD", r: 160, g: 190, b: 221 },
  { code: "820", name: "Royal Blue Very Dark", hex: "#0C2140", r: 12, g: 33, b: 64 },
  { code: "824", name: "Blue Very Dark", hex: "#1B4770", r: 27, g: 71, b: 112 },
  { code: "825", name: "Blue Dark", hex: "#3B6E96", r: 59, g: 110, b: 150 },
  { code: "826", name: "Blue Medium", hex: "#6093BA", r: 96, g: 147, b: 186 },
  { code: "827", name: "Blue Very Light", hex: "#BDD5E7", r: 189, g: 213, b: 231 },
  { code: "939", name: "Navy Blue Very Dark", hex: "#111E2E", r: 17, g: 30, b: 46 },
  { code: "995", name: "Electric Blue Dark", hex: "#0076A3", r: 0, g: 118, b: 163 },
  { code: "996", name: "Electric Blue Medium", hex: "#3BAFDE", r: 59, g: 175, b: 222 },
  { code: "3838", name: "Lavender Blue Dark", hex: "#5C7C9E", r: 92, g: 124, b: 158 },
  { code: "3839", name: "Lavender Blue Medium", hex: "#7E9AB8", r: 126, g: 154, b: 184 },
  { code: "3840", name: "Lavender Blue Light", hex: "#A8BCCF", r: 168, g: 188, b: 207 },
  { code: "3841", name: "Baby Blue Pale", hex: "#C7D8E6", r: 199, g: 216, b: 230 },
  { code: "3842", name: "Wedgwood Dark", hex: "#225983", r: 34, g: 89, b: 131 },

  // Purples
  { code: "550", name: "Violet Very Dark", hex: "#4C006A", r: 76, g: 0, b: 106 },
  { code: "327", name: "Violet Dark", hex: "#582467", r: 88, g: 36, b: 103 },
  { code: "552", name: "Violet Medium", hex: "#803C8A", r: 128, g: 60, b: 138 },
  { code: "553", name: "Violet", hex: "#92549D", r: 146, g: 84, b: 157 },
  { code: "554", name: "Violet Light", hex: "#C299C9", r: 194, g: 153, b: 201 },
  { code: "208", name: "Lavender Very Dark", hex: "#7B4B8B", r: 123, g: 75, b: 139 },
  { code: "209", name: "Lavender Dark", hex: "#9D75AA", r: 157, g: 117, b: 170 },
  { code: "210", name: "Lavender Medium", hex: "#BEA1C8", r: 190, g: 161, b: 200 },
  { code: "211", name: "Lavender Light", hex: "#D7C6E0", r: 215, g: 198, b: 224 },
  { code: "3837", name: "Lavender Ultra Dark", hex: "#6D2D7D", r: 109, g: 45, b: 125 },
  { code: "3836", name: "Grape Light", hex: "#A87FA6", r: 168, g: 127, b: 166 },

  // Browns / Neutrals
  { code: "300", name: "Mahogany Very Dark", hex: "#6E2F0D", r: 110, g: 47, b: 13 },
  { code: "301", name: "Mahogany Medium", hex: "#A65D34", r: 166, g: 93, b: 52 },
  { code: "400", name: "Mahogany Dark", hex: "#8A4117", r: 138, g: 65, b: 23 },
  { code: "433", name: "Brown Medium", hex: "#744E31", r: 116, g: 78, b: 49 },
  { code: "434", name: "Brown Light", hex: "#8A6446", r: 138, g: 100, b: 70 },
  { code: "435", name: "Brown Very Light", hex: "#A88261", r: 168, g: 130, b: 97 },
  { code: "436", name: "Tan", hex: "#C4A281", r: 196, g: 162, b: 129 },
  { code: "437", name: "Tan Light", hex: "#D8BEA3", r: 216, g: 190, b: 163 },
  { code: "801", name: "Coffee Brown Dark", hex: "#5E3E25", r: 94, g: 62, b: 37 },
  { code: "898", name: "Coffee Brown Very Dark", hex: "#4A301A", r: 74, g: 48, b: 26 },
  { code: "938", name: "Coffee Brown Ultra Dark", hex: "#362211", r: 54, g: 34, b: 17 },
  { code: "975", name: "Golden Brown Dark", hex: "#8F4F19", r: 143, g: 79, b: 25 },
  { code: "3826", name: "Golden Brown Dark Light", hex: "#AA6D2E", r: 170, g: 109, b: 46 },
  { code: "3827", name: "Pale Gold", hex: "#E9B880", r: 233, g: 184, b: 128 },
  { code: "3828", name: "Hazelnut Brown", hex: "#B8966E", r: 184, g: 150, b: 110 },

  // Greys
  { code: "317", name: "Pewter Grey", hex: "#6D7275", r: 109, g: 114, b: 117 },
  { code: "318", name: "Pewter Grey Light", hex: "#A3ABB1", r: 163, g: 171, b: 177 },
  { code: "413", name: "Pewter Grey Dark", hex: "#4D5357", r: 77, g: 83, b: 87 },
  { code: "414", name: "Steel Grey Dark", hex: "#878E94", r: 135, g: 142, b: 148 },
  { code: "415", name: "Pearl Grey", hex: "#C4C9CC", r: 196, g: 201, b: 204 },
  { code: "762", name: "Pearl Grey Very Light", hex: "#E2E4E6", r: 226, g: 228, b: 230 },
  { code: "3799", name: "Pewter Grey Very Dark", hex: "#303437", r: 48, g: 52, b: 55 },
  { code: "3866", name: "Mocha Brown Ultra Light", hex: "#EAE6D9", r: 234, g: 230, b: 217 }
];

/**
 * Converts a hex color string to RGB.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * Find the closest DMC color to the given RGB values using a weighted Euclidean distance
 * that approximates human visual sensitivity (perceptual color difference).
 */
export function findClosestDmcColor(r: number, g: number, b: number): DmcColor {
  let minDistance = Infinity;
  let closestColor = DMC_COLORS[0];

  for (const dmcColor of DMC_COLORS) {
    const meanR = (r + dmcColor.r) / 2;
    const deltaR = r - dmcColor.r;
    const deltaG = g - dmcColor.g;
    const deltaB = b - dmcColor.b;

    // Redmean color distance (highly accurate approximation of Delta E in RGB)
    const weightR = 2 + meanR / 256;
    const weightG = 4.0;
    const weightB = 2 + (255 - meanR) / 256;

    const distance = Math.sqrt(
      weightR * deltaR * deltaR +
      weightG * deltaG * deltaG +
      weightB * deltaB * deltaB
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = dmcColor;
    }
  }

  return closestColor;
}
