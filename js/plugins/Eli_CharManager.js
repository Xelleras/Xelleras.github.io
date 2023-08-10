//==========================================================================
// Eli_CharManager.js
//==========================================================================

/*:
@plugindesc ♦5.1.1♦ Changes a lot of character's sprite configurations.
@author Hakuen Studio

@help
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
Patreon      → https://www.patreon.com/hakuenstudio
Rate Plugin  → https://hakuenstudio.itch.io/eli-character-manager-for-rpg-maker/rate?source=game
Terms of Use → https://www.hakuenstudio.com/terms-of-use-5-0-0
Facebook     → https://www.facebook.com/hakuenstudio
Instagram    → https://www.instagram.com/hakuenstudio
Twitter      → https://twitter.com/hakuen_studio
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
============================================================================
Requirements
============================================================================

Need Eli Book.
Order After Eli Book.

============================================================================
Features
============================================================================

● Change the following characters configurations:
• Hue Color, Blend Color, Tone Color.
• Fade In/Out Characters
• Scale, Angle, Rotation, Offset, Skew

● You can change them by:
• Plugin Commands
• Event Notes
• Event Comments

● Works for:
• Events, Players, Followers, and Vehicles!

============================================================================
How to use
============================================================================

https://docs.google.com/document/d/1nrypK787j7TLfvHKv77X5xxMJSBecPvvBDPCe5V6_Pw/edit?usp=sharing

============================================================================

*/

"use strict"

var Eli = Eli || {}
var Imported = Imported || {}
Imported.Eli_CharManager = true

/* ========================================================================== */
/*                                    ALERT                                   */
/* ========================================================================== */
{

const pluginName = "Eli Char Manager"
const requiredVersion = 5.11
const messageVersion = "5.1.1"

if(!Eli.Book){

    const msg = `${pluginName}:\nYou are missing the core plugin: Eli Book.\nPlease, click ok to download it now.`
    if(window.confirm(msg)){
        nw.Shell.openExternal("https://hakuenstudio.itch.io/eli-book-rpg-maker-mv-mz")
    }

}else if(Eli.Book.version < requiredVersion){

    const msg = `${pluginName}:\nYou need Eli Book version ${messageVersion} or higher.\nPlease, click ok to download it now.`
    if(window.confirm(msg)){
        nw.Shell.openExternal("https://hakuenstudio.itch.io/eli-book-rpg-maker-mv-mz")
    }
}
    
}

/* ========================================================================== */
/*                                   PLUGIN                                   */
/* ========================================================================== */
{

class HueFilter extends PIXI.Filter{

    constructor(){
        super()
        this.initialize()
    }

    initialize(){
        PIXI.Filter.call(this, null, this._fragmentSrc())
        this.uniforms.hue = 0
        this.uniforms.brightness = 255
    }

    setHue(hue) {
        this.uniforms.hue = Number(hue)
    }

    _fragmentSrc() {
        const src =
            "varying vec2 vTextureCoord;" +
            "uniform sampler2D uSampler;" +
            "uniform float hue;" +
            "uniform vec4 colorTone;" +
            "uniform vec4 blendColor;" +
            "uniform float brightness;" +
            "vec3 rgbToHsl(vec3 rgb) {" +
            "  float r = rgb.r;" +
            "  float g = rgb.g;" +
            "  float b = rgb.b;" +
            "  float cmin = min(r, min(g, b));" +
            "  float cmax = max(r, max(g, b));" +
            "  float h = 0.0;" +
            "  float s = 0.0;" +
            "  float l = (cmin + cmax) / 2.0;" +
            "  float delta = cmax - cmin;" +
            "  if (delta > 0.0) {" +
            "    if (r == cmax) {" +
            "      h = mod((g - b) / delta + 6.0, 6.0) / 6.0;" +
            "    } else if (g == cmax) {" +
            "      h = ((b - r) / delta + 2.0) / 6.0;" +
            "    } else {" +
            "      h = ((r - g) / delta + 4.0) / 6.0;" +
            "    }" +
            "    if (l < 1.0) {" +
            "      s = delta / (1.0 - abs(2.0 * l - 1.0));" +
            "    }" +
            "  }" +
            "  return vec3(h, s, l);" +
            "}" +
            "vec3 hslToRgb(vec3 hsl) {" +
            "  float h = hsl.x;" +
            "  float s = hsl.y;" +
            "  float l = hsl.z;" +
            "  float c = (1.0 - abs(2.0 * l - 1.0)) * s;" +
            "  float x = c * (1.0 - abs((mod(h * 6.0, 2.0)) - 1.0));" +
            "  float m = l - c / 2.0;" +
            "  float cm = c + m;" +
            "  float xm = x + m;" +
            "  if (h < 1.0 / 6.0) {" +
            "    return vec3(cm, xm, m);" +
            "  } else if (h < 2.0 / 6.0) {" +
            "    return vec3(xm, cm, m);" +
            "  } else if (h < 3.0 / 6.0) {" +
            "    return vec3(m, cm, xm);" +
            "  } else if (h < 4.0 / 6.0) {" +
            "    return vec3(m, xm, cm);" +
            "  } else if (h < 5.0 / 6.0) {" +
            "    return vec3(xm, m, cm);" +
            "  } else {" +
            "    return vec3(cm, m, xm);" +
            "  }" +
            "}" +
            "void main() {" +
            "  vec4 sample = texture2D(uSampler, vTextureCoord);" +
            "  float a = sample.a;" +
            "  vec3 hsl = rgbToHsl(sample.rgb);" +
            "  hsl.x = mod(hsl.x + hue / 360.0, 1.0);" +
            "  hsl.y = hsl.y * (1.0 - colorTone.a / 255.0);" +
            "  vec3 rgb = hslToRgb(hsl);" +
            "  float r = rgb.r;" +
            "  float g = rgb.g;" +
            "  float b = rgb.b;" +
            "  float r2 = colorTone.r / 255.0;" +
            "  float g2 = colorTone.g / 255.0;" +
            "  float b2 = colorTone.b / 255.0;" +
            "  float r3 = blendColor.r / 255.0;" +
            "  float g3 = blendColor.g / 255.0;" +
            "  float b3 = blendColor.b / 255.0;" +
            "  float i3 = blendColor.a / 255.0;" +
            "  float i1 = 1.0 - i3;" +
            "  r = clamp((r / a + r2) * a, 0.0, 1.0);" +
            "  g = clamp((g / a + g2) * a, 0.0, 1.0);" +
            "  b = clamp((b / a + b2) * a, 0.0, 1.0);" +
            "  r = clamp(r * i1 + r3 * i3 * a, 0.0, 1.0);" +
            "  g = clamp(g * i1 + g3 * i3 * a, 0.0, 1.0);" +
            "  b = clamp(b * i1 + b3 * i3 * a, 0.0, 1.0);" +
            "  r = r * brightness / 255.0;" +
            "  g = g * brightness / 255.0;" +
            "  b = b * brightness / 255.0;" +
            "  gl_FragColor = vec4(r, g, b, a);" +
            "}";
        return src;
    }

}

Eli.CharManager = {

    version: 5.11,
    url: "https://hakuenstudio.itch.io/eli-character-manager-for-rpg-maker",
    parameters: {},
    alias: {},

    initialize(){
        this.initParameters()
        this.initPluginCommands()
    },

    initParameters(){},

    initPluginCommands(){},

    param(){
        return this.parameters
    },

    changeTone(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            color: args[1].includes("_") ? args[1].split("_") : args[1],
            duration: args[2] || "1",
            wait: (args[3] || "false").toLowerCase(),
            canDeleteColorFilter: "false",
        }
        const parameters = this.processColorParameters(objArgs)
        const color = Eli.ColorManager.getRgbForTone(objArgs.color)
        
        this.processColorChange("setToneColor", color, parameters)
    },

    changeBlendColor(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            color: args[1].includes("_") ? args[1].split("_") : args[1],
            duration: args[2] || "1",
            wait: (args[3] || "false").toLowerCase(),
            canDeleteColorFilter: "false",
        }
        const parameters = this.processColorParameters(objArgs)
        const color = Eli.ColorManager.getRgbForBlend(objArgs.color)

        this.processColorChange("setBlendColor", color, parameters)
    },

    changeHue(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            color: args[1].includes("_") ? args[1].split("_") : args[1],
            duration: args[2] || "1",
            wait: (args[3] || "false").toLowerCase(),
            canDeleteColorFilter: "false",
        }
        const parameters = this.processColorParameters(objArgs)
        const color = Number(objArgs.color)

        this.processColorChange("setHueColor", color, parameters)
    },

    processColorParameters(args){
        const canDeleteColorFilter = args.canDeleteColorFilter === "true"
        const duration = Number(Eli.Utils.convertEscapeVariablesOnly(args.duration))
        const ids = this.createIds(args.id)
        const wait = args.wait === "true"

        return [canDeleteColorFilter, duration, ids, wait]
    },

    fade(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            opacity: args[1],
            duration: args[2] || "1",
            wait: (args[3] || "false").toLowerCase(),
        }

        const duration = Number(Eli.Utils.convertEscapeVariablesOnly(objArgs.duration))
        const ids =  this.createIds(objArgs.id)
        const targetOpacity = Number(Eli.Utils.convertEscapeVariablesOnly(objArgs.opacity))
        const wait = objArgs.wait === "true"

        for(const id of ids){
            const charId = Eli.Utils.needEval(id)
            const character = Eli.Utils.getMapCharacter(charId)

            if(character){
                character.setFade(targetOpacity, duration)
            }
        }

        if(wait){
            Eli.PluginManager.currentInterpreter.wait(duration)
        }
    },

    deleteAllColorFilters(){
        $gameMap.events().forEach(item => item.deleteColorFilter())
        $gamePlayer.deleteColorFilter()
        $gamePlayer.followers()._data.forEach(item => item.deleteColorFilter())
        $gameMap.vehicles().forEach(item => item.deleteColorFilter())
    },

    deleteCharColorFilter(args){
        const objArgs = {id: args[0].toLowerCase()}
        const ids = this.createIds(objArgs.id)

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){
                character.deleteColorFilter()
            }
        }
    },

    createIds(ids){
        const vehicles = $gameMap.vehicles().map(item => item._type.toLowerCase())
        const vehicle = vehicles.find(vehicle => ids.includes(vehicle))

        if(vehicle){
            return [vehicle]
        }else{
            return Eli.PluginManager.createRangeOfNumbers(ids)
        }
    },

    cmd_offset(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            operation: args[1].toLowerCase() === "set" ? "Set" : "Add",
            x: args[2],
            y: args[3],
        }
        const [ids, x, y] = this.createIdsAndXY(objArgs)

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){

                if(objArgs.operation === "Set"){
                    character.setCoordOffset(x, y)
                }else{
                    character.addCoordOffset(x, y) 
                }
            }
        }
    },

    cmd_angle(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            operation: args[1].toLowerCase() === "set" ? "Set" : "Add",
            angle: args[2],
        }
        const ids = this.createIds(objArgs.id)
        const angle = Number(Eli.Utils.processEscapeVarOrFormula(objArgs.angle))

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){

                if(objArgs.operation === "Set"){
                    character.setAngle(angle)
                }else{
                    character.addAngle(angle) 
                }
            }
        }
    },

    cmd_rotation(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            operation: args[1].toLowerCase() === "set" ? "Set" : "Add",
            rotation: args[2],
        }
        const ids = this.createIds(objArgs.id)
        const rotationSpeed = Number(Eli.Utils.processEscapeVarOrFormula(objArgs.rotation))

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){

                if(objArgs.operation === "Set"){
                    character.setAngleRotationSpeed(rotationSpeed)
                }else{
                    character.addAngleRotationSpeed(rotationSpeed) 
                }
            }
        }
    },

    cmd_scale(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            operation: args[1].toLowerCase() === "set" ? "Set" : "Add",
            x: args[2],
            y: args[3],
        }
        const [ids, x, y] = this.createIdsAndXY(objArgs)

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){

                if(objArgs.operation === "Set"){
                    character.setScale(x, y)
                }else{
                    character.addScale(x, y) 
                }
            }
        }
    },

    cmd_skew(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            operation: args[1].toLowerCase() === "set" ? "Set" : "Add",
            x: args[2],
            y: args[3],
        }
        const [ids, x, y] = this.createIdsAndXY(objArgs)

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){

                if(args.operation === "Set"){
                    character.setSkew(x, y)
                }else{
                    character.addSkew(x, y) 
                }
            }
        }
    },

    cmd_extraZ(args){
        const objArgs = {
            id: args[0].toLowerCase(),
            operation: args[1].toLowerCase() === "set" ? "Set" : "Add",
            zValue: args[2],
        }
        const ids = this.createIds(objArgs.id)
        const zValue = Number(Eli.Utils.processEscapeVarOrFormula(objArgs.zValue))

        for(const id of ids){
            const character = Eli.Utils.getMapCharacter(id)

            if(character){

                if(objArgs.operation === "Set"){
                    character.setExtraZIndex(zValue)
                }else{
                    character.addExtraZIndex(zValue) 
                }
            }
        }
    },

    processColorChange(setColorType, color, parameters){
        const [canDeleteColorFilter, duration, ids] = parameters

        for(const id of ids){
            const charId = Eli.Utils.needEval(id)
            const character = Eli.Utils.getMapCharacter(charId)

            if(character){

                if(setColorType === "setHueColor"){
                    character.getMapSprite()._createHueColorFilter()
                }
    
                character[setColorType](color, duration)
            }
        }
    },

    createIdsAndXY(args){
        const ids = this.createIds(args.id)
        const x = Number(Eli.Utils.processEscapeVarOrFormula(args.x))
        const y = Number(Eli.Utils.processEscapeVarOrFormula(args.y))

        return [ids, x, y]
    },

    executePluginCommandMV(command, args){
        const cmdList = {
            CHARTONE: "changeTone",
            CHARHUE: "changeHue",
            CHARBLENDCOLOR: "changeBlendColor",
            CHARFADE: "fade",
            CHAROFFSET: "cmd_offset",
            CHARANGLE: "cmd_angle",
            CHARROTATION: "cmd_rotation",
            CHARSCALE: "cmd_scale",
            CHARSKEW: "cmd_skew",
            CHARRESETCOLOR: "deleteCharColorFilter",
            CHARRESETCOLORALL: "deleteAllColorFilters",
            CHARZ: "cmd_extraZ",
        }
        const cmd = cmdList[command.toUpperCase()]

        if(this[cmd]){
            this[cmd](args)
        }
    },
}

const Plugin = Eli.CharManager
const Alias = Eli.CharManager.alias

Plugin.initialize()

/* --------------------------- GAME CHARACTER BASE -------------------------- */
{

Alias.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers
Game_CharacterBase.prototype.initMembers = function() {
    Alias.Game_CharacterBase_initMembers.call(this)
    this.initFadeMembers()
    this.initColorMembers()
    this.initOffsetMembers()
    this.initAngleMembers()
    this.initScaleMembers()
    this.initSkewMembers()
    this.initExtraZIndex()
}

Game_CharacterBase.prototype.initFadeMembers = function() {
    this.fadeChangeDuration = 0
    this.fadeTargetOpacity = 0
}

Game_CharacterBase.prototype.initColorMembers = function(){
    this.initToneColors()
    this.initBlendColors()
    this.initHueColors()
}

Game_CharacterBase.prototype.initToneColors = function(){
    this.toneColor = this.toneColor || [0, 0, 0, 0]
    this.toneTargetColor = this.toneTargetColor || [0, 0, 0, 0]
    this.toneChangeDuration = 0
}

Game_CharacterBase.prototype.initBlendColors = function(){
    this.blendColor = this.blendColor || [0, 0, 0, 0]
    this.blendTargetColor = this.blendTargetColor || [0, 0, 0, 0]
    this.blendChangeDuration = 0
}

Game_CharacterBase.prototype.initHueColors = function(){
    this.hueColor = this.hueColor || 0
    this.hueTargetColor = 0
    this.hueChangeDuration = 0
}

Game_CharacterBase.prototype.initOffsetMembers = function() {
    this.coordOffsetX = 0
    this.coordOffsetY = 0
}

Game_CharacterBase.prototype.initAngleMembers = function() {
    this.angle = 0
    this.angleRotationSpeed = 0
}

Game_CharacterBase.prototype.initScaleMembers = function() {
    this.scaleX = 1
    this.scaleY = 1
}

Game_CharacterBase.prototype.initSkewMembers = function() {
    this.skewX = 0
    this.skewY = 0
}

Game_CharacterBase.prototype.initExtraZIndex = function() {
    this.extraZIndex = 0
}

Game_CharacterBase.prototype.setFade = function(targetOpacity, duration){
    this.fadeTargetOpacity = targetOpacity
    this.fadeChangeDuration = duration
}

Game_CharacterBase.prototype.setToneColor = function(tone, duration){
    this.toneTargetColor = tone
    this.toneChangeDuration = duration
}

Game_CharacterBase.prototype.setBlendColor = function(blendColor, duration){
    this.blendTargetColor = blendColor
    this.blendChangeDuration = duration
}

Game_CharacterBase.prototype.setHueColor = function(hue, duration){
    this.hueTargetColor = hue
    this.hueChangeDuration = duration
}

Game_CharacterBase.prototype.setCoordOffset = function(x, y){
    this.coordOffsetX = x
    this.coordOffsetY = y
}

Game_CharacterBase.prototype.addCoordOffset = function(x, y){
    this.coordOffsetX += x
    this.coordOffsetY += y
}

Game_CharacterBase.prototype.setAngle = function(angle) {
    this.angle = angle * Math.PI / 180
}

Game_CharacterBase.prototype.addAngle = function(angle) {
    this.angle += angle * Math.PI / 180
}

Game_CharacterBase.prototype.setAngleRotationSpeed = function(angle) {
    this.angleRotationSpeed = angle * Math.PI / 180   
}

Game_CharacterBase.prototype.addAngleRotationSpeed = function(angle) {
    this.angleRotationSpeed += angle * Math.PI / 180   
}

Game_CharacterBase.prototype.setScale = function(x, y) {
    this.scaleX = x
    this.scaleY = y
}

Game_CharacterBase.prototype.addScale = function(x, y) {
    this.scaleX += x
    this.scaleY += y  
}

Game_CharacterBase.prototype.setSkew = function(x, y) {
    this.skewX = x
    this.skewY = y
}

Game_CharacterBase.prototype.addSkew = function(x, y) {
    this.skewX += x
    this.skewY += y  
}

Game_CharacterBase.prototype.setExtraZIndex = function(value) {
    this.extraZIndex = value
}

Game_CharacterBase.prototype.addExtraZIndex = function(value) {
    this.extraZIndex += value 
}

Game_CharacterBase.prototype.updateFade = function() {
    if(this.fadeChangeDuration > 0){
        const d = this.fadeChangeDuration

        this._opacity = (this._opacity * (d - 1) + this.fadeTargetOpacity) / d
        this.fadeChangeDuration--
    }
}

Game_CharacterBase.prototype.updateColorFilter = function(sprite){
    this.updateToneColor(sprite)
    this.updateBlendColor(sprite)
    this.updateHue(sprite)
}

Game_CharacterBase.prototype.updateToneColor = function(sprite){
    if (this.toneChangeDuration > 0) {
        const d = this.toneChangeDuration

        for (let i = 0; i < 4; i++) {
            this.toneColor[i] = (this.toneColor[i] * (d - 1) + this.toneTargetColor[i]) / d
        }
        this.toneChangeDuration--
    }
}

Game_CharacterBase.prototype.updateBlendColor = function(sprite){
    if (this.blendChangeDuration > 0) {
        const d = this.blendChangeDuration

        for (let i = 0; i < 4; i++) {
            this.blendColor[i] = (this.blendColor[i] * (d - 1) + this.blendTargetColor[i]) / d
        }
        this.blendChangeDuration--
    }
}

Game_CharacterBase.prototype.updateHue = function(sprite){
    if (this.hueChangeDuration > 0) {
        const d = this.hueChangeDuration

        this.hueColor = (this.hueColor * (d - 1) + this.hueTargetColor) / d
        this.hueChangeDuration--
    }
}

Game_CharacterBase.prototype.updateAngleRotation = function() {
    if (this.angleRotationSpeed !== 0) {
        if(this.angle === 360 || this.angle === -360) {
            this.angle = 0
        }
        this.angle = (this.angle + this.angleRotationSpeed).clamp(-360, 360)
    }
}

Game_CharacterBase.prototype.deleteColorFilter = function(){
    this.hueColor = 0
    this.hueTargetColor = 0
    this.toneColor = [0, 0, 0, 0]
    this.toneTargetColor = [0, 0, 0, 0]
    this.blendColor = [0, 0, 0, 0]
    this.blendTargetColor = [0, 0, 0, 0]
}

Alias.Game_CharacterBase_screenZ = Game_CharacterBase.prototype.screenZ
Game_CharacterBase.prototype.screenZ = function() {
    return Alias.Game_CharacterBase_screenZ.call(this) + this.extraZIndex
}

}

/* ------------------------------- GAME EVENT ------------------------------- */
{

Game_Event.prototype.parseMeta_Hue = function(string) {
    const data = string.split(",")
    const color = Number(data[0]) || 0
    const duration = 1

    this.setHueColor(color, duration)

    return [color, duration]
}

Game_Event.prototype.parseMeta_BlendColor = function(string) {
    const color = Eli.ColorManager.getRgbForBlend(Eli.String.removeSpaces(string))
    const duration = 1
    
    this.setBlendColor(color, duration)
    
    return [color, duration]
}

Game_Event.prototype.parseMeta_Tone = function(string) {
    const color = Eli.ColorManager.getRgbForTone(Eli.String.removeSpaces(string))
    const duration = 1

    this.setToneColor(color, duration)
    
    return [color, duration]
}

Game_Event.prototype.parseMeta_Offset = function(string) {
    const [x, y] = string.split(",").map(coord => Number(coord) || 0)
    this.setCoordOffset(x, y)

    return [x, y]
}

Game_Event.prototype.parseMeta_Angle = function(value) {
    const angle = Number(value)
    this.setAngle(angle)

    return angle
}

Game_Event.prototype.parseMeta_Rotation = function(value) {
    const rotation = Number(value)
    this.setAngleRotationSpeed(rotation)

    return rotation
}

Game_Event.prototype.parseMeta_Scale = function(string) {
    const [x, y] = string.split(",").map(coord => Number(coord) || 1)
    this.setScale(x, y)

    return [x, y]
}

Game_Event.prototype.parseMeta_Skew = function(string) {
    const [x, y] = string.split(",").map(coord => Number(coord) || 0)
    this.setSkew(x, y)

    return [x, y]
}

Game_Event.prototype.isCharManagerCommentCommand = function(command) {
    return command.code === 108 && command.parameters[0].toLowerCase().includes("charmanager")
}

Alias.Game_Event_afterSetupPage = Game_Event.prototype.afterSetupPage
Game_Event.prototype.afterSetupPage = function(){
    this.needIterateList = this.needIterateList || this.list().some(cmd => this.isCharManagerCommentCommand(cmd))
    Alias.Game_Event_afterSetupPage.call(this)
}

Alias.Game_Event_onListIteration = Game_Event.prototype.onListIteration
Game_Event.prototype.onListIteration = function(index){
    const aliasIndex = Alias.Game_Event_onListIteration.call(this, index)
    const cmd = this.list()[aliasIndex]

    if(cmd && this.isCharManagerCommentCommand(cmd)){
        this.processCharManagerComment(aliasIndex)
    }

    return aliasIndex
}

Game_Event.prototype.processCharManagerComment = function(aliasIndex){
    let comments = ''
    let nextIndex = aliasIndex + 1

    while(this.list()[nextIndex].code === 408){
        const nextCmd = this.list()[nextIndex]
        comments += nextCmd.parameters[0]
        nextIndex++
    }
    
    if(comments.length > 0){
        this.executeCharManagerComment(comments)
    }
}

Game_Event.prototype.executeCharManagerComment = function(comment){
    const regExp = /<([^<>:]+)(:?)([^>]*)>/g
    
    for(;;){
        const match = regExp.exec(comment)

        if(match){      
            const key = match[1]
            const value = match[3]
            const dummy = (arg) => arg
            const func = this[`parseMeta_${key}`].bind(this) || dummy.bind(this)
            func(value)

        }else{
            break
        }
    }
}

}

/* ---------------------------- GAME INTERPRETER ---------------------------- */
{

Alias.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
Game_Interpreter.prototype.pluginCommand = function (command, args) {
Alias.Game_Interpreter_pluginCommand.call(this, command, args)
    Plugin.executePluginCommandMV(command, args)
}

}

/* ---------------------------- SPRITE CHARACTER ---------------------------- */
{

Alias.Sprite_Character_initMembers = Sprite_Character.prototype.initMembers
Sprite_Character.prototype.initMembers = function() {
    Alias.Sprite_Character_initMembers.call(this)
    this.initHueColorFilter()
    this.pivotAdjust = 0
}

Sprite_Character.prototype.initHueColorFilter = function(){
    this.hueColorFilter = null
    this.hue = 0
}

Alias.Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter
Sprite_Character.prototype.setCharacter = function(character){
    Alias.Sprite_Character_setCharacter.call(this, character)
    if(character.needColorFilter){
        this.refreshColorFilter()
    }
}

Sprite_Character.prototype.refreshColorFilter = function() {
    this.setBlendColor(this._character.blendColor)
    this.setColorTone(this._character.toneColor)
    this.setHue(this._character.hueColor)
}

Alias.Sprite_Character_onTileBitmapLoad = Sprite_Character.prototype.onTileBitmapLoad
Sprite_Character.prototype.onTileBitmapLoad = function() {
    Alias.Sprite_Character_onTileBitmapLoad.call(this)
    this.setPivotAdjustment()
}

Alias.Sprite_Character_onCharacterBitmapLoad = Sprite_Character.prototype.onCharacterBitmapLoad
Sprite_Character.prototype.onCharacterBitmapLoad = function() {
    Alias.Sprite_Character_onCharacterBitmapLoad.call(this)
    this.setPivotAdjustment()
}

Sprite_Character.prototype.setPivotAdjustment = function(){
    this.pivotAdjust = this.patternHeight() / 2 
}

Alias.Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition
Sprite_Character.prototype.updatePosition = function() {
    Alias.Sprite_Character_updatePosition.call(this)
    this.updateCoordOffset()
}

Sprite_Character.prototype.updateCoordOffset = function(){
    this.x += this._character.coordOffsetX
    this.y += this._character.coordOffsetY
}

Alias.Sprite_Character_updateOther = Sprite_Character.prototype.updateOther
Sprite_Character.prototype.updateOther = function() {
    Alias.Sprite_Character_updateOther.call(this)
    this.updateFadeOpacity()
    this.updateColors()
    this.updateAngleRotation()
    this.updateAngle()
    this.updateScale()
    this.updateSkew()
}

Sprite_Character.prototype.updateFadeOpacity = function(){
    this._character.updateFade()
}

Sprite_Character.prototype.updateColors = function(){
    this._character.updateColorFilter(this)
    this.setColorTone(this._character.toneColor)
    this.setBlendColor(this._character.blendColor)
    this.hue = this._character.hueColor
    this._updateHueColorFilter()
}

Sprite_Character.prototype._updateHueColorFilter = function() {
    if(!this.hueColorFilter) return
    this.hueColorFilter.setHue(this.hue)
}

Sprite_Character.prototype.updateAngleRotation = function(){
    this._character.updateAngleRotation()
}

Sprite_Character.prototype.updateAngle = function(){
    this.rotation = this._character.angle
    
    if(this.rotation !== 0){
        this.adjustPositionForAngle()
    }else{
        this.pivot.y = 0
    }
}

Sprite_Character.prototype.adjustPositionForAngle = function(){
    this.pivot.y = -(this.pivotAdjust / this.scale.y)
    this.y -= this.pivotAdjust
}

Sprite_Character.prototype.updateScale = function(){
    this.scale.x = this._character.scaleX
    this.scale.y = this._character.scaleY
}

Sprite_Character.prototype.updateSkew = function(){
    this.skew.x = this._character.skewX
    this.skew.y = this._character.skewY
}

Sprite_Character.prototype._createHueColorFilter = function() {
    if(!this.hueColorFilter){
        this.hueColorFilter = new HueFilter()
        if (!this._filters) {
            this._filters = []
        }
        const hasFilter = this._filters.find(item => item instanceof HueFilter)
        if(!hasFilter){
            this._filters.push(this.hueColorFilter)
        }
    }
}

}

}