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
