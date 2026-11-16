# Siri Shortcuts for Casa Pixel

Each shortcut is one HTTP call to the Supabase project. `<CODE>` is the house code in `.house-code`
(never commit it; it is the only thing protecting the data).

Common to every call:

- Method: `POST`
- Header `apikey`: the `SUPABASE_KEY` value in `js/config.js`
- Header `Content-Type`: `application/json`
- The answer is a short Portuguese sentence in quotes, ready for "Speak Text" / "Show Result".

| What you say | URL | Request body (JSON) |
|---|---|---|
| "Que plantas têm sede?" | `https://jamqegxvhmeqxlngugls.supabase.co/rest/v1/rpc/casa_thirsty` | `{"p_secret":"<CODE>"}` |
| "Reguei as plantas" (asks which) | `…/rest/v1/rpc/casa_water` | `{"p_secret":"<CODE>","p_target":"<answer>"}` |
| "Reguei as plantas com sede" | `…/rest/v1/rpc/casa_water` | `{"p_secret":"<CODE>","p_target":"todas","p_only_thirsty":true}` |

`p_target` accepts a plant name ("jiboia"), a group name ("mesas da janela"), a room ("sala", "varanda")
or "todas". Case and accents are ignored.

## Building one in the Shortcuts app

1. New shortcut, named with the phrase you want to say to Siri.
2. (Only for "Reguei as plantas") add **Ask for Input** — "Que plantas regaste?".
3. Add **Get Contents of URL**: the URL above, Method `POST`, the two headers, Request Body `JSON` with the fields above
   (`p_target` = the "Provided Input" variable).
4. Add **Speak Text** with the result of step 3.

The page picks the change up within 30 seconds, or as soon as it becomes visible again.
