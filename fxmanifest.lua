fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'lscripts'
description 'UI kit for RedM'
version '1.3.0'
lua54 'yes'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/theme.css',
    'html/assets/*'
}

shared_scripts {
    'config.lua',
    'locales/*.lua',
    'locale.lua'
}

client_scripts {
    'client/main.lua',
    'client/chat.lua'
}

server_scripts {
    'server/main.lua',
    'server/chat.lua',
    'server/version.lua'
}
