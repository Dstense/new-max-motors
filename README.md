# NEW MAX MOTORS website

A responsive, static website for NEW MAX MOTORS, a used-car dealer in Goregaon East, Mumbai. No framework, build step, database, or paid API is required.

## Run locally

1. Extract the ZIP.
2. Open `index.html` in a browser, or use VS Code's Live Server extension for a local preview.
3. An internet connection is needed for the externally hosted vehicle images and Google Fonts.

## Included

- Responsive homepage, vehicle shortlist, dealership information, sell/exchange form, FAQs, and WhatsApp enquiry links.
- Working search, brand, fuel and price sorting controls for the featured cars.
- On-page SEO title/description, Open Graph tags, semantic headings, local `AutoDealer` structured data and a sitemap.
- Listing links and pre-filled WhatsApp enquiry messages for three publicly indexed NEW MAX MOTORS OLX listings.

## Important before publishing

- Featured car information was taken from public OLX/dealer results found on 8 November 2026, but each listing may be old, sold, edited or repriced. Check stock and details with the dealer before promoting any car.
- Vehicle card and hero photos are representative model images, not verified photos of the exact advertised cars. Replace them with current dealer-owned photographs before publishing.
- The WhatsApp number is taken from the supplied catalogue link (`+91 99879 51585`). Confirm the contact details and hours.
- The canonical URL, sitemap and robots.txt currently use `https://new-max-motors.netlify.app/`. If Netlify assigns a different URL, replace it in `index.html`, `robots.txt`, and `sitemap.xml`.
- For local SEO, keep the business name, address and phone consistent on the official Google Business Profile and dealer marketplaces. Ask customers for genuine reviews; do not publish fabricated reviews.
- A static website cannot automatically sync OLX inventory. Update featured cars and source links whenever the listings change.

## Public listing references reviewed

- Maruti Suzuki XL6: https://www.olx.in/item/cars-c84-used-maruti-suzuki-xl6-in-andheri-east-mumbai-iid-1853401696
- Renault Duster: https://www.olx.in/item/cars-c84-used-renault-duster-in-borivali-east-mumbai-iid-1819420124
- Kia Seltos: https://www.olx.in/item/cars-c84-used-kia-seltos-in-kurla-east-mumbai-iid-1857090430

## Deploy on Netlify

Static site; set the publish directory to the repository root (`.`) and leave the build command blank.

## Facebook inventory added (indexed on 8 November 2026)

Firecrawl Search found public Facebook posts labelled NEW MAX MOTORS for the following cars. They have been added as enquiries with their original source post links:

- Kia Seltos HTX Plus D1.5 6AT, 2019 — 96,000 km shown in the search snippet; source: https://www.facebook.com/groups/930241221170316/posts/2241606543367104/
- Tata Punch Pure 1.2 CNG, 2023 — 70,000 km, first owner and company-fitted CNG stated in the snippet; source: https://www.facebook.com/amin.tamboli.79/posts/%EF%B8%8Fnew-max-motors%EF%B8%8Ftata-punch-pur-12-cng-2023-model-1st-owner-insurance-valid-70000/3392642680905758/
- Mahindra Thar Roxx AX7L D AT 4WD, 2026 — 9,400 km and first owner stated; source: https://www.facebook.com/groups/202230208756836/posts/1298645039115342/
- Honda Accord 2.4 i-VTEC AT, 2010 — 52,000 km and second owner stated; source: https://www.facebook.com/amin.tamboli.79/posts/%EF%B8%8Fnew-max-motors%EF%B8%8Fhonda-accord-24-i-vtec-at-2010-model-2nd-owner-insurance-no-5200/3471638526339506/
- Volkswagen Vento 1.5 TDI Highline AT, 2016 — 75,000 km and first owner stated; source: https://www.facebook.com/amin.tamboli.79/posts/%EF%B8%8Fnew-max-motors%EF%B8%8Fvw-vento-15-tdi-highline-at-2016-model-1st-ownerinsurance-valid-/3422891601214199/
- Audi A6 Matrix 2.0 TDI, 2012 — fourth owner, diesel automatic and sunroof mentioned; odometer unit/value not confidently extracted; source: https://www.facebook.com/amin.tamboli.79/videos/%EF%B8%8Fnew-max-motors%EF%B8%8Faudi-a6-matrix-20-tdi-2012-model-4th-owner-insurance-valid68000-/1609851050798132/
- Kia Sonet D1.5 6AT HTK Plus, 2021 — source: https://www.facebook.com/groups/3681542415277998/posts/27708652832140287/
- BMW 5 Series 520d Luxury Line, 2013 — first owner and comprehensive insurance mentioned; source: https://www.facebook.com/amin.tamboli.79/videos/%EF%B8%8Fnew-max-motors%EF%B8%8Fbmw-5series-520d-luxury-line-2013-model-1st-owner-comprehensive-/1064588239398465/
- Ford Endeavour 3.2L Titanium 4WD AT, 2019 — first owner mentioned; source: https://www.facebook.com/amin.tamboli.79/videos/%EF%B8%8Fnew-max-motors%EF%B8%8Fford-endeavour-32l-titanium-4wd-at-2019-model-1st-owner-insuranc/1043410268572419/

Important: Firecrawl Search returned indexed snippets, but direct Firecrawl scraping of Facebook URLs was blocked (HTTP 403). Thus the cards link back to public source posts, car prices are marked "Price on request" unless an asking price is separately confirmed, and images are model-reference photos rather than verified vehicle photographs. Reconfirm each post and vehicle details with the dealer before treating a listing as live stock.
