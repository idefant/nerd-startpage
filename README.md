# Nerd Startpage

Nerd Startpage is designed to organize frequently used links in one place.

## Features

- Lightweight and fast
- Categories in the style of masonry
- Suggestions
- Easy configuration file
- Using Shortcuts
- Minimalistic

## Preview

![Preview](.github/preview.png?raw=true)
![Searching Preview](.github/searching.png?raw=true)

## Usage

1. Download [config file](config.yaml)
2. Edit this file
3. Create your own github repo and upload your config
4. Get link to uploaded config (For example: https://raw.githubusercontent.com/idefant/nerd-startpage/main/config.yaml)
5. Download extension for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/nerd-startpage/)
6. Open new tab
7. Click on the settings icon
8. Enter the link you received in step 4
9. Click on the reload icon

## Shortcuts

You can use shortcuts by adding a colon to the beginning. For example, by typing `:gh` and pressing `Enter` you can open project's Github repository. The list of links can be changed in the file `config.yaml`:

## Production

Build extension using `npm run build` command. Then go to <https://addons.mozilla.org/en-US/developers/> and sign the extension

## Development

Start extension using `npm run dev` command. Then open <about:debugging#/runtime/this-firefox> and load the addon by clicking "Load Temporary Add-on"
