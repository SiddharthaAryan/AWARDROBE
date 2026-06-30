# WardrobeOS

A personal outfit recommendation engine built from Sid's real MBA wardrobe.

## Current features

- Five context modes: Lecture, Auditorium, Presentation, Roam Around, Party
- Top 20 outfit recommendations per mode
- Presentation flow asks whether a suit is needed
- Roam Around flow supports Slightly Formal and Casual Casual modes
- Manual outfit builder with filtered dropdowns
- Suit + shirt + tie + footwear logic for auditorium and suited presentations
- Attractiveness score out of 100
- Colour dots for visual outfit palette preview
- Save favourite looks in local storage
- Copy outfit text
- Wardrobe inventory browser

## File structure

- `index.html` — app shell
- `style.css` — UI and responsive styling
- `wardrobeData.js` — wardrobe database
- `script.js` — outfit scoring and recommendation engine

## Next build targets

- Add belt/watch/perfume accessory logic
- Add laundry status
- Add last-worn tracking
- Add trip packing planner
- Add Firebase login and cloud wardrobe sync
