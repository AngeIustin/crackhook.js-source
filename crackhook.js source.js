var js_items = ["Misc", "JAVASCRIPT", "Script Items"];
var rbot_weapon_types = ["GENERAL", "PISTOL", "HEAVY PISTOL", "SCOUT", "AWP", "AUTOSNIPER"];
var reworked_lbot_guns = ["Pistol", "Heavy pistol", "Heavy", "Rifle", "SMG", "Scout", "AWP", "Autosnipers"];
var rbot_hitboxes = ["Head", "Upper chest", "Chest", "Lower chest", "Stomach", "Pelvis", "Legs", "Feet"];

//Fuck y'all 3iq people who can't download Mathlib.
function setup_menu() {
    UI.AddCheckbox("Enable semirage assist");
    UI.AddHotkey("Legitbot aimkey");
    UI.AddHotkey("Autowall");
    UI.AddDropdown("Currently configured weapon", reworked_lbot_guns);
    for (var i = 0; i < 8; i++) {
        var current_gun = reworked_lbot_guns[i];
        UI.AddMultiDropdown(current_gun + " allowed hitboxes", rbot_hitboxes);
        UI.AddSliderFloat(current_gun + " dynamic FOV min", 0.1, 180.0);
        UI.AddSliderFloat(current_gun + " dynamic FOV max", 0.1, 180.0);
        if (i == 2 || i == 3 || i == 4) {
            UI.AddSliderInt(current_gun + " minimum damage", 0, 130);
            UI.AddSliderInt(current_gun + " hitchance", 0, 100);
            UI.AddCheckbox(current_gun + " prefer bodyaim");
            UI.AddCheckbox(current_gun + " prefer safepoint");
        }
        UI.AddDropdown(current_gun + " w/o autowall key", ["Autowall on triggers", "No autowall", "Full autowall"]);
        UI.AddMultiDropdown(current_gun + " autowall triggers", ["Hitbox visible", "Hurt us", "In autowall FOV", "We are low HP", "Ragebot shot him before", "On peek"]);
        UI.AddSliderFloat(current_gun + " time after hurt (s)", 0.01, 10);
        UI.AddSliderFloat(current_gun + " autowall FOV", 0.5, 10.0);
        UI.AddSliderFloat(current_gun + " shot expire time (s)", 1, 120);
        UI.AddDropdown(current_gun + " legit hitbox selection mode", ["Closest to crosshair", "Most damage"]);
        UI.AddSliderFloat(current_gun + " legit smooth", 2.0, 15);
        UI.AddSliderFloat(current_gun + " RCS (p)", 0.0, 0.25);
        UI.AddSliderFloat(current_gun + " RCS (y)", 0.0, 0.25);
        UI.AddSliderInt(current_gun + " legit mindmg", 1, 100);
        UI.AddSliderFloat(current_gun + " kill delay", 0.01, 1.5);
    }
    UI.AddCheckbox("Trigger fakelag on visible");
    UI.AddSliderInt("Choke on visible", 0, 8);
    UI.AddSliderInt("Normal choke", 0, 8);
    UI.AddCheckbox("Enable legit AA");
    UI.AddCheckbox("Safety checks");
    UI.AddDropdown("LBY Mode", ["Safe", "Extend", "Break", "Centered"]);
    UI.AddHotkey("Legit AA juke (only in rage)");
    UI.AddCheckbox("Legit AA edge detection");
    UI.AddDropdown("Peeking mode", ["Peek with fake", "Peek with real"]);
    UI.AddMultiDropdown("Semirage assist indicators", ["Aimbot status", "Autowall", "Legit AA", "Choke", "Aim mode", "Enemy possible real yaw side", "Watermark", "MM Info"]);

    UI.AddSliderFloat("Indicator offset (y)", 0.55, 0.8);
    UI.AddColorPicker("Side text color");

    UI.AddColorPicker("Watermark accent color");
    UI.SetColor(js_items, "Watermark accent color", [255, 255, 255, 200]);
    UI.AddCheckbox("Rage shot logs");

    UI.AddCheckbox("Trashtalk");
}

setup_menu();

var local = 0;

var script_config = {
    rbot_active: 0,
    lbot_active: 0,
    script_active: 0,

    rbot_allowed_hitboxes: -1,
    rbot_fov_min: -1,
    rbot_fov_max: -1,
    rbot_fov_awall: -1,

    rbot_optional_mindmg: -1,
    rbot_optional_hc: -1,
    rbot_optional_baim: 0,
    rbot_optional_safepoint: 0,

    autowall_active: 0,
    autowall_mode: -1,

    legit_autowall_modifiers: -1,
    legit_autowall_hurt_time: -1,
    legit_autowall_ragebot_decay_time: -1,

    lbot_tgt_select: -1,
    lbot_smooth: -1,
    lbot_rcs_x: -1,
    lbot_rcs_y: -1,
    lbot_mindmg: -1,
    lbot_kill_delay: -1,

    legitaa_active: 0,
    legitaa_safety_active: 0,
    legitaa_lby_mode: -1,
    legitaa_juke_active: 0,
    legitaa_edge_active: 0,
    legitaa_edge_distance: -1,
    legitaa_peek_behavior: -1,

    gay_fakelag_active: 0,
    gay_fakelag_vis_choke: -1,
    gay_fakelag_invis_choke: -1,

    indicator_picks: -1,
    indicator_offset: -1,

    indicator_enemy_side_col: [0, 0, 0, 255],
    indicator_watermark_accent_col: [0, 0, 0, 255],

    rage_shot_log: 0,
    trashtalk: 0,
};
//Trying out a new model for this shit

var cached_wpnname = "";
var cached_wpntype = -1;

function get_weapon_for_config() {
    var wpn_name = Entity.GetName(Entity.GetWeapon(local));
    if (cached_wpnname == wpn_name) {
        return cached_wpntype;
    }
    var ret = 0;
    switch (wpn_name) {
        case "usp s":
        case "p2000":
        case "glock 18":
        case "dual berettas":
        case "p250":
        case "tec 9":
        case "five seven":
        case "cz75 auto":
            break;
        case "desert eagle":
        case "r8 revolver":
            ret = 1;
            break;
        case "nova":
        case "xm1014":
        case "mag 7":
        case "sawed off":
        case "m249":
        case "negev":
            ret = 2;
            break;
        case "famas":
        case "galil ar":
        case "ak 47":
        case "m4a4":
        case "m4a1 s":
        case "sg 553":
        case "aug":
            ret = 3;
            break;
        case "mac 10":
        case "mp9":
        case "mp7":
        case "mp5 sd":
        case "ump 45":
        case "pp bizon":
        case "p90":
            ret = 4;
            break;
        case "ssg 08":
            ret = 5;
            break;
        case "awp":
            ret = 6;
            break;
        case "scar 20":
        case "g3sg1":
            ret = 7;
            break;
        default:
            ret = -1; //on knives/whatnot
            break;
    }
    cached_wpnname = wpn_name;
    cached_wpntype = ret;
    return ret;
}

function convert_weapon_index_into_rbot_idx(wpn_index) //Converts current weapon type into ragebot index
{
    switch (wpn_index) {
        case 0:
            return 1;
        case 1:
            return 2;
        case 2:
        case 3:
        case 4:
            return 0;
        case 5:
            return 3;
        case 6:
            return 4;
        case 7:
            return 5;
        case -1:
            return -1;
    }
}

var prev_wpntype_settings = -1;

function update_settings() {
    script_config.script_active = UI.GetValue(js_items, "Enable semirage assist");

    script_config.rbot_active = UI.IsHotkeyActive("Rage", "General", "Enabled");
    script_config.lbot_active = UI.IsHotkeyActive(js_items, "Legitbot aimkey");
    script_config.autowall_active = UI.IsHotkeyActive(js_items, "Autowall");

    script_config.legitaa_active = UI.GetValue(js_items, "Enable legit AA");
    script_config.legitaa_safety_active = UI.GetValue(js_items, "Safety checks");
    script_config.legitaa_lby_mode = UI.GetValue(js_items, "LBY Mode");
    script_config.legitaa_juke_active = UI.IsHotkeyActive(js_items, "Legit AA juke");
    script_config.legitaa_edge_active = UI.GetValue(js_items, "Legit AA edge detection");
    script_config.legitaa_peek_behavior = UI.GetValue(js_items, "Peeking mode");

    script_config.gay_fakelag_active = UI.GetValue(js_items, "Trigger fakelag on visible");
    script_config.gay_fakelag_vis_choke = UI.GetValue(js_items, "Choke on visible");
    script_config.gay_fakelag_invis_choke = UI.GetValue(js_items, "Normal choke");

    script_config.indicator_picks = UI.GetValue(js_items, "Semirage assist indicators");
    script_config.indicator_offset = UI.GetValue(js_items, "Indicator offset (y)");
    script_config.indicator_enemy_side_col = UI.GetColor(js_items, "Side text color");
    script_config.indicator_watermark_accent_col = UI.GetColor(js_items, "Watermark accent color");

    script_config.rage_shot_log = UI.GetValue(js_items, "Rage shot logs");
    script_config.trashtalk = UI.GetValue(js_items, "Trashtalk");
    if (World.GetServerString() == "" || !Entity.IsValid(local) || !Entity.IsAlive(local)) {
        return; //Can't really go further without using localplayer's weapon.
    }

    var local_weapon_type = get_weapon_for_config();
    if (local_weapon_type == -1) {
        return;
    }

    var weapon_name = reworked_lbot_guns[local_weapon_type];

    script_config.autowall_mode = UI.GetValue(js_items, weapon_name + " w/o autowall key");
    script_config.legit_autowall_modifiers = UI.GetValue(js_items, weapon_name + " autowall triggers");
    script_config.legit_autowall_hurt_time = UI.GetValue(js_items, weapon_name + " time after hurt (s)");
    script_config.legit_autowall_ragebot_decay_time = UI.GetValue(js_items, weapon_name + " shot expire time (s)");
    script_config.rbot_fov_awall = UI.GetValue(js_items, weapon_name + " autowall FOV");

    script_config.rbot_allowed_hitboxes = UI.GetValue(js_items, weapon_name + " allowed hitboxes");

    script_config.rbot_fov_min = UI.GetValue(js_items, weapon_name + " dynamic FOV min");
    script_config.rbot_fov_max = UI.GetValue(js_items, weapon_name + " dynamic FOV max");

    script_config.lbot_smooth = UI.GetValue(js_items, weapon_name + " legit smooth");
    script_config.lbot_tgt_select = UI.GetValue(js_items, weapon_name + " legit hitbox selection mode");
    script_config.lbot_rcs_x = UI.GetValue(js_items, weapon_name + " RCS (p)");
    script_config.lbot_rcs_y = UI.GetValue(js_items, weapon_name + " RCS (y)");
    script_config.lbot_mindmg = UI.GetValue(js_items, weapon_name + " legit mindmg");
    script_config.lbot_kill_delay = UI.GetValue(js_items, weapon_name + " kill delay");

    if (convert_weapon_index_into_rbot_idx(local_weapon_type) == 0) {
        script_config.rbot_optional_mindmg = UI.GetValue(js_items, weapon_name + " minimum damage");
        script_config.rbot_optional_hc = UI.GetValue(js_items, weapon_name + " hitchance");
        script_config.rbot_optional_baim = UI.GetValue(js_items, weapon_name + " prefer bodyaim");
        script_config.rbot_optional_safepoint = UI.GetValue(js_items, weapon_name + " prefer safepoint");
    }
    prev_wpntype_settings = local_weapon_type;
}

var last_script_enabled_state = -1; //Force the script to update the visibility on load
var last_configured_weapon = -1; //Cached to prevent useless visibility updates.
var last_autowall_mode = -1;
var last_legitaa_mode = -1;
var last_fakelag_state = -1;
var was_legitaa_edge_active = -1;
var last_awall_state_for_weapons = [-1, -1, -1, -1, -1, -1, -1, -1]; //im a gamer
var last_awall_triggers_for_weapons = [-1, -1, -1, -1, -1, -1, -1, -1];
var old_indicator_picks = -1;

function handle_visibility() {
    if (!UI.IsMenuOpen()) {
        return; //What's the point of handling menu visibility if the damn thing isn't even visible?
    }
    var indicator_picks = UI.GetValue(js_items, "Semirage assist indicators");
    if (script_config.script_active != last_script_enabled_state || last_legitaa_mode != script_config.legitaa_active || was_legitaa_edge_active != script_config.legitaa_edge_active || indicator_picks != old_indicator_picks || last_fakelag_state != script_config.gay_fakelag_active) {
        UI.SetEnabled(js_items, "Autowall", script_config.script_active);
        UI.SetEnabled(js_items, "Legitbot aimkey", script_config.script_active);
        UI.SetEnabled(js_items, "Currently configured weapon", script_config.script_active);

        UI.SetEnabled(js_items, "Enable legit AA", script_config.script_active);
        UI.SetEnabled(js_items, "Safety checks", script_config.script_active && script_config.legitaa_active);
        UI.SetEnabled(js_items, "LBY Mode", script_config.script_active && script_config.legitaa_active);
        UI.SetEnabled(js_items, "Legit AA juke (only in rage)", script_config.script_active && script_config.legitaa_active);

        UI.SetEnabled(js_items, "Legit AA edge detection", script_config.script_active && script_config.legitaa_active);
        UI.SetEnabled(js_items, "Peeking mode", script_config.script_active && script_config.legitaa_active && script_config.legitaa_edge_active);
        UI.SetEnabled(js_items, "Semirage assist indicators", script_config.script_active);

        UI.SetEnabled(js_items, "Indicator offset (y)", script_config.script_active);

        UI.SetEnabled(js_items, "Side text color", script_config.script_active && indicator_picks & (1 << 6));
        UI.SetEnabled(js_items, "Watermark accent color", script_config.script_active && indicator_picks & (1 << 7));
        UI.SetEnabled(js_items, "Rage shot logs", script_config.script_active);
        UI.SetEnabled(js_items, "Trashtalk", script_config.script_active);

        UI.SetEnabled(js_items, "Trigger fakelag on visible", script_config.script_active);
        UI.SetEnabled(js_items, "Choke on visible", script_config.script_active && script_config.gay_fakelag_active);
        UI.SetEnabled(js_items, "Normal choke", script_config.script_active && script_config.gay_fakelag_active);
    }
    old_indicator_picks = indicator_picks;
    last_fakelag_state = script_config.gay_fakelag_active;
    var cur_selected_gun = UI.GetValue(js_items, "Currently configured weapon"); //Shame I have to do it like this.
    var lbot_weapons_length = 8; //Hardcoded because it won't change lol

    for (var i = 0; i < lbot_weapons_length; i++) {
        var weapon_name = reworked_lbot_guns[i];
        if (last_configured_weapon != cur_selected_gun || script_config.script_active != last_script_enabled_state) {
            UI.SetEnabled(js_items, weapon_name + " allowed hitboxes", script_config.script_active && cur_selected_gun == i);

            UI.SetEnabled(js_items, weapon_name + " dynamic FOV min", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " dynamic FOV max", script_config.script_active && cur_selected_gun == i);

            UI.SetEnabled(js_items, weapon_name + " legit hitbox selection mode", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " legit smooth", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " legit mindmg", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " RCS (p)", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " RCS (y)", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " kill delay", script_config.script_active && cur_selected_gun == i);

            UI.SetEnabled(js_items, weapon_name + " hitchance", script_config.script_active && cur_selected_gun == i && (i == 2 || i == 3 || i == 4));
            UI.SetEnabled(js_items, weapon_name + " minimum damage", script_config.script_active && cur_selected_gun == i && (i == 2 || i == 3 || i == 4));
            UI.SetEnabled(js_items, weapon_name + " prefer bodyaim", script_config.script_active && cur_selected_gun == i && (i == 2 || i == 3 || i == 4));
            UI.SetEnabled(js_items, weapon_name + " prefer safepoint", script_config.script_active && cur_selected_gun == i && (i == 2 || i == 3 || i == 4));
        }
        var awall_mode = UI.GetValue(weapon_name + " w/o autowall key");
        if (last_configured_weapon != cur_selected_gun || script_config.script_active != last_script_enabled_state || awall_mode != last_awall_state_for_weapons[i]) {
            UI.SetEnabled(js_items, weapon_name + " w/o autowall key", script_config.script_active && cur_selected_gun == i);
            UI.SetEnabled(js_items, weapon_name + " autowall triggers", script_config.script_active && cur_selected_gun == i && awall_mode == 0);
        }
        var awall_triggers = UI.GetValue(weapon_name + " autowall triggers");
        if (last_configured_weapon != cur_selected_gun || script_config.script_active != last_script_enabled_state || awall_mode != last_awall_state_for_weapons[i] || awall_triggers != last_awall_triggers_for_weapons[i]) {
            UI.SetEnabled(js_items, weapon_name + " time after hurt (s)", script_config.script_active && cur_selected_gun == i && awall_mode == 0 && awall_triggers & (1 << 1));
            UI.SetEnabled(js_items, weapon_name + " autowall FOV", script_config.script_active && cur_selected_gun == i && awall_mode == 0 && awall_triggers & (1 << 2));
            UI.SetEnabled(js_items, weapon_name + " shot expire time (s)", script_config.script_active && cur_selected_gun == i && awall_mode == 0 && awall_triggers & (1 << 4));
        }
        last_awall_state_for_weapons[i] = awall_mode;
        last_awall_triggers_for_weapons[i] = awall_triggers;
    }
    last_script_enabled_state = script_config.script_active;
    last_configured_weapon = cur_selected_gun;
    was_legitaa_edge_active = script_config.legitaa_edge_active;
}
handle_visibility();

function rad2deg(rad) {
    return rad * (180 / Math.PI);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function vector_add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vector_sub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vector_mul_fl(a, fl) {
    return [a[0] * fl, a[1] * fl, a[2] * fl];
}

function vector_div_fl(a, fl) {
    return [a[0] / fl, a[1] / fl, a[2] / fl];
}

function vector_length(a) {
    return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function random_float(min, max) {
    return Math.random() * (max - min) + min;
}

function angle_diff(angle1, angle2) {
    var diff = angle1 - angle2;
    diff %= 360;
    if (diff > 180) {
        diff -= 360;
    }
    if (diff < -180) {
        diff += 360;
    }
    return diff;
}

function normalize_angle(angle) {
    var ang = angle;
    ang[0] = clamp(ang[0], -89, 89);
    ang[1] %= 360;
    if (ang[1] > 180) {
        ang[1] -= 360;
    }
    if (ang[1] < -180) {
        ang[1] += 360;
    }
    ang[2] = 0;
    return ang;
}

function get_choked_ticks_for_entity(entity) {
    return clamp(Math.floor((Globals.Curtime() - Entity.GetProp(entity, "CBaseEntity", "m_flSimulationTime")) / Globals.TickInterval()), 0, 16);
}

function get_hitbox_name(hitbox) //Useless, but I love the bloody shot logs
{
    var hitbox_name = "";
    switch (hitbox) {
        case 0:
            hitbox_name = "head";
            break;
        case 1:
            hitbox_name = "neck";
            break;
        case 2:
            hitbox_name = "pelvis";
            break;
        case 3:
            hitbox_name = "body";
            break;
        case 4:
            hitbox_name = "thorax";
            break;
        case 5:
            hitbox_name = "chest";
            break;
        case 6:
            hitbox_name = "upper chest";
            break;
        case 7:
            hitbox_name = "left thigh";
            break;
        case 8:
            hitbox_name = "right thigh";
            break;
        case 9:
            hitbox_name = "left calf";
            break;
        case 10:
            hitbox_name = "right calf";
            break;
        case 11:
            hitbox_name = "left foot";
            break;
        case 12:
            hitbox_name = "right foot";
            break;
        case 13:
            hitbox_name = "left hand";
            break;
        case 14:
            hitbox_name = "right hand";
            break;
        case 15:
            hitbox_name = "left upper arm";
            break;
        case 16:
            hitbox_name = "left forearm";
            break;
        case 17:
            hitbox_name = "right upper arm";
            break;
        case 18:
            hitbox_name = "right forearm";
            break;
        default:
            hitbox_name = "generic";
    }

    return hitbox_name;
}

function get_ragebot_hitgroup_for_hitbox(hitbox) {
    switch (hitbox) {
        case 0:
        case 1:
            return 0;
        case 6:
        case 15:
        case 16:
        case 17:
        case 18:
            return 1;
        case 5:
        case 13:
        case 14:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
        case 2:
            return 5;
        case 7:
        case 8:
        case 9:
        case 10:
            return 6;
        case 11:
        case 12:
            return 7;
    }
}

/**
 * 
 * @param {*} {array} from 
 * @param {*} {array} to 
 * @param {*} {array} base_angle
 * @returns {array} angle delta from base angle to calculated angle 
 */
function calculate_angle(from, to, base_angle) {
    var delta = vector_sub(from, to);
    var ret_angle = [];
    ret_angle[0] = rad2deg(Math.atan(delta[2] / Math.hypot(delta[0], delta[1]))) - base_angle[0];
    ret_angle[1] = rad2deg(Math.atan(delta[1] / delta[0])) - base_angle[1];
    ret_angle[2] = 0;
    if (delta[0] >= 0.0)
        ret_angle[1] += 180.0;

    return normalize_angle(ret_angle);
}

//Sets up the config for generic weapons and sets up the dynamic ragebot FOV.
function setup_config_and_dyn_fov() {
    var fov_max = script_config.rbot_fov_max;
    var fov_min = script_config.rbot_fov_min;

    var new_dynamic_fov = 0;

    var weapon_type = get_weapon_for_config();
    if (weapon_type == -1) {
        return; //No point configuring it if we're holding a knife or something, right?
    }
    var rbot_weapon_type = convert_weapon_index_into_rbot_idx(weapon_type);
    var rbot_config_string = rbot_weapon_types[rbot_weapon_type];
    if (rbot_weapon_type == 0) {
        UI.SetValue("Rage", rbot_config_string, "Accuracy", "Prefer safe point", script_config.rbot_optional_safepoint); //Can't force the hack to PREFER bodyaim or safepoint through the new API functions.
        UI.SetValue("Rage", rbot_config_string, "Accuracy", "Prefer body aim", script_config.rbot_optional_baim);
    }

    var old_fov = UI.GetValue("Rage", rbot_config_string, "Targeting", "FOV");
    var local_render_origin = Entity.GetRenderOrigin(local);

    var enemies = Entity.GetEnemies();
    var enemy_arr_length = enemies.length;
    var distance = 10000;
    for (var i = 0; i < enemy_arr_length; i++) {
        if (Entity.IsValid(enemies[i]) && Entity.IsAlive(enemies[i]) && !Entity.IsDormant(enemies[i])) {
            if (rbot_weapon_type == 0) {
                Ragebot.ForceTargetMinimumDamage(enemies[i], script_config.rbot_optional_mindmg);
                Ragebot.ForceTargetHitchance(enemies[i], script_config.rbot_optional_hc);
            }
            var enemy_render_origin = Entity.GetRenderOrigin(enemies[i]);
            var current_distance = vector_length(vector_sub(local_render_origin, enemy_render_origin));
            if (distance > current_distance) {
                distance = current_distance;
            }
        }
    }
    if (distance != 10000) {
        new_dynamic_fov = clamp((6000 / distance) * 2.5, fov_min, fov_max); //Forced to those values to simplify settings.
    } else //We haven't found any enemies.
    {
        new_dynamic_fov = old_fov;
    }
    UI.SetValue("Rage", rbot_config_string, "Targeting", "FOV", new_dynamic_fov);
}

function are_we_peeking_particular_enemy(extrapolated_local_eyepos, target) {
    var target_stomach_pos = Entity.GetHitboxPosition(target, 2);
    if (typeof(target_stomach_pos) != "undefined") {
        var trace = Trace.Line(local, extrapolated_local_eyepos, target_stomach_pos);
        if (trace[0] == target || trace[1] > 0.85) {
            return true;
        }
    }
    return false;
}

function are_we_peeking(local_eye_position, velocity, predicted_ticks) //premium, also stolen from my doubletap peek thing
{
    var extrapolated_local_eyepos = vector_add(local_eye_position, vector_mul_fl(velocity, predicted_ticks * Globals.TickInterval()));
    var enemies = Entity.GetEnemies();
    var enemy_arr_length = enemies.length;
    for (var i = 0; i < enemy_arr_length; i++) {
        if (Entity.IsValid(enemies[i]) && Entity.IsAlive(enemies[i]) && !Entity.IsDormant(enemies[i])) {
            if (are_we_peeking_particular_enemy(extrapolated_local_eyepos, enemies[i])) {
                return true;
            }
        }
    }
    return false;
}

var players_who_hurt_us = [];
var ragebot_targets_this_round = [];

function handle_autowall() {
    var is_legit_autowall_active = script_config.autowall_mode == 0;

    var is_full_autowall_active = script_config.autowall_active || script_config.autowall_mode == 2;

    var enemies = Entity.GetEnemies();
    var enemy_arr_length = enemies.length;

    var current_weapon = get_weapon_for_config();
    if (current_weapon == -1) //Do not ask, sometimes it may get buggy for some reason, this is what I think is the issue
    {
        for (var i = 0; i < enemy_arr_length; i++) {
            Ragebot.IgnoreTarget(enemies[i]);
        }
        return; //No point handling autowall if the current weapon is invalid.
    }
    var allowed_rbot_hitboxes = script_config.rbot_allowed_hitboxes;
    var current_rbot_category = convert_weapon_index_into_rbot_idx(current_weapon);

    if (is_full_autowall_active) {
        UI.SetValue("Rage", rbot_weapon_types[current_rbot_category], "Targeting", "Hitboxes", allowed_rbot_hitboxes);
        return;
    }


    var visible_hitbox_check = is_legit_autowall_active && script_config.legit_autowall_modifiers & (1 << 0);

    var hurt_check = is_legit_autowall_active && script_config.legit_autowall_modifiers & (1 << 1);
    var hurt_length = script_config.legit_autowall_hurt_time;

    var fov_check = is_legit_autowall_active && script_config.legit_autowall_modifiers & (1 << 2);
    var autowall_fov = script_config.rbot_fov_awall;

    var local_lowhp_check = is_legit_autowall_active && script_config.legit_autowall_modifiers & (1 << 3);

    var rbot_target_check = is_legit_autowall_active && script_config.legit_autowall_modifiers & (1 << 4);
    var rbot_target_decay_time = script_config.legit_autowall_ragebot_decay_time;

    var peek_check = is_legit_autowall_active && script_config.legit_autowall_modifiers & (1 << 5);

    if (local_lowhp_check) {
        var local_health = Entity.GetProp(local, "CBasePlayer", "m_iHealth");
        if (local_health < 25) //fuck them if we're low hp, i should prolly make this user-adjustable
        {
            return;
        }
    }

    var is_hitbox_potentially_unsafe = function(hitbox) {
        return (hitbox <= 1 || hitbox >= 6);
    }

    if (current_rbot_category == 4) //hehehe
    {
        for (var i = 0; i <= 12; i++) {
            if (is_hitbox_potentially_unsafe(i)) {
                Ragebot.ForceHitboxSafety(i);
            }
        }
    }

    var current_rbot_fov = UI.GetValue("Rage", rbot_weapon_types[current_rbot_category], "Targeting", "FOV"); //Quick optimization by ignoring every target outside FOV without tracing to them.

    var valid_enemies = []; //a slightly better implementation, probs

    var local_eyepos = Entity.GetEyePosition(local);
    var local_viewangles = Local.GetViewAngles();

    var extrapolated_local_eyepos = [];
    var local_velocity = Entity.GetProp(local, "CBasePlayer", "m_vecVelocity[0]");
    if (peek_check) {
        extrapolated_local_eyepos = vector_add(local_eyepos, vector_mul_fl(local_velocity, 16 * Globals.TickInterval()))
    }
    var scan_potential_ragebot_target = function(target) {
        var visible_hitbox_amount = 0; //turkish guy don't accuse me of pasting, i dont even have your bloody code
        var returned_object = {
            successful: false,
            proper_hitboxes: 0
        };
        for (var i = 10; i >= 0; i--) {
            var ragebot_corresponding_hitgroup = get_ragebot_hitgroup_for_hitbox(i);
            if ((allowed_rbot_hitboxes & (1 << ragebot_corresponding_hitgroup)) || visible_hitbox_check) {
                var hitbox = Entity.GetHitboxPosition(target, i);
                if (typeof(hitbox) != "undefined") {
                    if (fov_check) {
                        var angle_to_hitbox = calculate_angle(local_eyepos, hitbox, local_viewangles);
                        var fov = Math.hypot(angle_to_hitbox[0], angle_to_hitbox[1]);
                        if (autowall_fov > fov) {
                            returned_object.successful = true;
                            break;
                        }
                    }
                    var trace = Trace.Line(local, local_eyepos, hitbox);
                    if (trace[0] == target) {
                        visible_hitbox_amount++
                        returned_object.proper_hitboxes |= (1 << ragebot_corresponding_hitgroup);
                        if (visible_hitbox_check) {
                            returned_object.successful = true;
                            break; //If we have that check, it will add all the allowed hitboxes to the ragebot's scanlist, so we can just break here.
                        }
                    }
                }
            }
        }
        if (!returned_object.successful) {
            if (visible_hitbox_amount > 0) {
                returned_object.successful = true;
            }
        }
        return returned_object;
    }

    for (var i = 0; i < enemy_arr_length; i++) {
        var head_hitbox = Entity.GetHitboxPosition(enemies[i], 0);
        if (typeof(head_hitbox != "undefined")) {
            var angle_to_head = calculate_angle(local_eyepos, head_hitbox, local_viewangles);
            var fov_to_head = Math.hypot(angle_to_head[0], angle_to_head[1]);
            if (current_rbot_fov > fov_to_head) {
                valid_enemies.push({
                    entindex: enemies[i],
                    head_fov: fov_to_head
                });
                continue;
            }
        }
        Ragebot.IgnoreTarget(enemies[i]);
    }

    var valid_enemies_len = valid_enemies.length;

    if (valid_enemies_len == 0) {
        return; //We won't be shooting anybody.
    }

    valid_enemies.sort(function(entity_a, entity_b) {
        return entity_a.head_fov - entity_b.head_fov
    }); //We want the dude who's closest to us as the first one.

    var scanned_object_success = {
        successful: false,
        proper_hitboxes: 0
    };
    for (var i = 0; i < valid_enemies_len; i++) {
        var enemy = valid_enemies[i];
        if (hurt_check) {
            if (players_who_hurt_us.some(function(value) {
                    return value.cisgendered_pig == enemy.entindex && value.time_he_hurt_us + hurt_length > Globals.Curtime();
                })) {
                continue;
            }
        }
        if (rbot_target_check) {
            if (ragebot_targets_this_round.some(function(value) {
                    return value.aimbot_target == enemy.entindex && value.shot_time + rbot_target_decay_time > Globals.Curtime();
                })) {
                continue;
            }
        }
        if (peek_check) {
            if (vector_length(local_velocity) > 70 && are_we_peeking_particular_enemy(extrapolated_local_eyepos, enemy.entindex)) {
                continue;
            }
        }
        var returned_object = scan_potential_ragebot_target(enemy.entindex);
        if (returned_object.successful) {
            scanned_object_success = returned_object;
            Ragebot.ForceTarget(enemy.entindex);
            break;
        } else {
            Ragebot.IgnoreTarget(enemy.entindex);
        }
    }
    if (scanned_object_success.successful) {
        UI.SetValue("Rage", rbot_weapon_types[current_rbot_category], "Targeting", "Hitboxes", (is_legit_autowall_active && script_config.legit_autowall_modifiers != 0) ? allowed_rbot_hitboxes : scanned_object_success.proper_hitboxes);
    }
}

var peek_time = 0.0;
var current_proper_direction = 0;
var last_peek = 0.0;
var indicator_dir = 0;

//That's a lotta global vars. 

function handle_legitaa_safety() {
    if (Entity.IsValid(local) && Entity.IsAlive(local)) {
        if (!script_config.legitaa_safety_active) {
            return true; //epic gamer move
        }
        var current_framerate = 1 / Globals.Frametime();
        var current_choke = get_choked_ticks_for_entity(local);
        return current_framerate >= 100 && current_choke < 4; //Quick bandaid check.
    }
    return true;
}

function handle_legitaa() //there are quite a bit of (probably useless) tricks to hinder the enemy's ability to resolve us here
{
    var are_we_safe = handle_legitaa_safety();
    if (script_config.legitaa_active && are_we_safe) {
        var is_autodirection_used = script_config.legitaa_edge_active;
        var is_peek_invert_active = script_config.legitaa_peek_behavior == 1;
        var lby_mode = script_config.legitaa_lby_mode;

        var local_velocity = Entity.GetProp(local, "CBasePlayer", "m_vecVelocity[0]");
        var local_velocity_length = vector_length(local_velocity);
        var current_inversion = indicator_dir; //If I set it to 0, it gets all weird.
        if (is_autodirection_used) {
            current_inversion = current_proper_direction;
        }
        if (is_autodirection_used && is_peek_invert_active && last_peek + 0.4 < Globals.Curtime()) {
            var localplayer_eyepos = Entity.GetEyePosition(local);
            var in_peek = are_we_peeking(localplayer_eyepos, local_velocity, 16);
            if (in_peek) {
                peek_time += Globals.TickInterval();
            }
            if (peek_time > 2.0) {
                peek_time = 0;
                in_peek = false;
                last_peek = Globals.Curtime();
            }
            if (local_velocity_length > 33 && in_peek) {
                current_inversion *= -1; //To fuck up antifreestanding resolvers (and most legit AA resolvers should be doing anti-freestanding at some point in time, otherwise they're horribly lucky.)
            }
        }
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Information", "Restrictions", 0);
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Enabled", 1);
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Yaw offset", 180);
        UI.SetValue("Anti-Aim", "Extra", "Pitch", 0);
        UI.SetValue("Anti-Aim", "Fake angles", "Enabled", 1);

        if (!is_autodirection_used) {
            current_inversion = UI.IsHotkeyActive("Anti-Aim", "Fake angles", "Inverter") == 1 ? -1 : 1;
        }

        AntiAim.SetOverride(1);
        var should_use_juke = lby_mode == 1 && script_config.legitaa_juke_active; //If we're using "safe" LBY, we can't exactly trick dumb resolvers into trying to resolve us as if we were using opposite.
        var real_yaw_offset = 60 * current_inversion * (should_use_juke ? -1 : 1);
        var lower_body_yaw_offset = 0;
        var real_yaw = Local.GetRealYaw();
        var fake_yaw = Local.GetFakeYaw();
        if (lby_mode == 1) {
            var fake_delta = Math.abs(angle_diff(fake_yaw, real_yaw));
            lower_body_yaw_offset = (60 * -current_inversion);
            if (fake_delta > 105) {
                lower_body_yaw_offset = 180; //whats the point of fancy shit, keeping lby delta at 180 is probably the most efficient move
            }
        } else if (lby_mode == 2) {
            var local_eye_yaw_netvar = Entity.GetProp(local, "CCSPlayer", "m_angEyeAngles")[1];

            var local_eye_yaw_real_delta = angle_diff(local_eye_yaw_netvar, real_yaw);
            var local_eye_yaw_fake_delta = angle_diff(local_eye_yaw_netvar, fake_yaw);

            real_yaw_offset = local_eye_yaw_real_delta > 35 ? (15 * current_inversion) : (60 * random_float(0.6, 2.5) * current_inversion); //MMMM magic numbers the love of my life
            lower_body_yaw_offset = 160 * -current_inversion + local_eye_yaw_fake_delta < 50 ? ((Globals.Curtime() * 180 / random_float(-5, 5) % 240) * -current_inversion) : ((Globals.Curtime() * 360 / random_float(-0.1, 0.3) % 91) * -current_inversion);
            //AND EVEN MORE MAGIC NUMBERS
            if (Globals.Tickcount() % 3 == 0) {
                lower_body_yaw_offset *= -1.5;
            }
        } //it was 1am when i wrote this, I doubt it will actually do anything rofl
        //please dont paste this PLEASE I BEG YOU
        else if (lby_mode == 3) {
            real_yaw_offset = (local_velocity_length > 3.3 ? 60 : 15) * current_inversion;
            lower_body_yaw_offset = 120 * -current_inversion;
            if (Globals.Tickcount() % 7 == 0) {
                lower_body_yaw_offset = Math.random() < 0.5 ? 0 : 180;
            }
        }
        AntiAim.SetRealOffset(real_yaw_offset);
        AntiAim.SetLBYOffset(lower_body_yaw_offset);
        indicator_dir = current_inversion;
    } else {
        AntiAim.SetOverride(0); //Bad code, but seems to flick less due to reasons I have no clue about.
        UI.SetValue("Anti-Aim", "Rage Anti-Aim", "Enabled", 0);
    }
}

var were_we_peeking = false;

function handle_fakelag() {
    if (script_config.gay_fakelag_active) {
        var local_eyepos = Entity.GetEyePosition(local);
        var local_velocity = Entity.GetProp(local, "CBasePlayer", "m_vecVelocity[0]");
        var peek = are_we_peeking(local_eyepos, local_velocity, 12);
        if (peek != were_we_peeking) {
            were_we_peeking = peek;
            UI.SetValue("Anti-Aim", "Fake-Lag", "Limit", peek ? script_config.gay_fakelag_vis_choke : script_config.gay_fakelag_invis_choke);
        }
    }
}

//Shamelessly pasted from April's script due to me being too lazy to figure out the easy math myself. Returns 1 on left and -1 on right. Won't work very well against spinners, though.
//This is also better than the idea I had, so its good lol
function handle_edge_detection(entity, step) //I recommend the step being divisible by 15.
{
    if (Entity.IsValid(entity) && Entity.IsAlive(entity) && !Entity.IsDormant(entity)) {
        var ent_headpos = Entity.GetHitboxPosition(entity, 0);
        var ent_eyeangles = [0, 0, 0];
        if (entity == local) {
            ent_eyeangles = Local.GetViewAngles();
        } else {
            ent_eyeangles = Entity.GetProp(entity, "CCSPlayer", "m_angEyeAngles");
        }
        var left_fractions = 0;
        var right_fractions = 0;

        var base_yaw = ent_eyeangles[1] - 90;
        var end_yaw = ent_eyeangles[1] + 90;

        for (var current_step = base_yaw; current_step <= end_yaw; current_step += step) {
            if (current_step == ent_eyeangles[1]) {
                continue; //Not exactly a side, I guess.
            }
            var point_next_to_ent = vector_add(ent_headpos, [Math.cos(deg2rad(current_step)) * 450, Math.sin(deg2rad(current_step)) * 450, 0]);
            var ray = Trace.Line(entity, ent_headpos, point_next_to_ent);
            current_step < ent_eyeangles[1] ? left_fractions += ray[1] : right_fractions += ray[1];
        }

        left_fractions /= (90 / step);
        right_fractions /= (90 / step);

        return left_fractions > right_fractions ? 1 : -1;
    }
    return 0;
}

var mm_ranks = ["None", "S1", "S2", "S3", "S4", "SE", "SEM",
    "GN1", "GN2", "GN3", "GNM",
    "MG1", "MG2", "MGE", "DMG",
    "LE", "LEM", "Supreme", "Global"
];

function aa_shit_color(abs_yaw, desired_alpha) //dunno why I have it in a separate function, stole from april cause cba 
{
    return [190 - (abs_yaw * 75 / 40), 40 + (abs_yaw * 146 / 60), 10, desired_alpha];
}

function render_outlined_indicator(x, y, text, color) {
    var font = Render.AddFont("Verdana", 10, 800);
    var additional_font = Render.AddFont("Verdana", 10, 1600);
    Render.StringCustom(x - 1, y - 1, 1, text, [0, 0, 0, 255], additional_font);
    Render.StringCustom(x, y, 1, text, color, font);
}

function handle_indicators() {
    if (script_config.script_active && script_config.indicator_picks) {
        var screensize = Render.GetScreenSize();
        var screen_center_x = screensize[0] * 0.5;
        var watermark_font = Render.AddFont("Verdana", 8, 250);
        if (Entity.IsValid(local)) {
            var base_yaw = screensize[1] * script_config.indicator_offset; //not actually yaw l0l
            if (Entity.IsAlive(local)) {
                if (script_config.indicator_picks & (1 << 0)) {
                    var is_aimbot_active = script_config.rbot_active ? true : script_config.lbot_active;
                    var text = "AIM"
                    var weapon_type = get_weapon_for_config();
                    var converted_ragebot_type = convert_weapon_index_into_rbot_idx(weapon_type);
                    if (converted_ragebot_type != -1) {
                        var weapon_cur_fov = UI.GetValue("Rage", rbot_weapon_types[converted_ragebot_type], "Targeting", "FOV");
                        var string = " FOV: " + weapon_cur_fov;
                        text += string;
                    }
                    render_outlined_indicator(screen_center_x, base_yaw, text, (is_aimbot_active ? [77.5, 186, 10, 200] : [255, 25, 30, 200]));
                    base_yaw += 15;
                    if (converted_ragebot_type != -1 && script_config.rbot_active) {
                        var are_we_preferring_safety = UI.GetValue("Rage", rbot_weapon_types[converted_ragebot_type], "Accuracy", "Prefer safe point");
                        var safety_forced = UI.IsHotkeyActive("Rage", "GENERAL", "General", "Force safe point");

                        if (are_we_preferring_safety || safety_forced) {
                            var color = safety_forced ? [77.5, 186, 10, 200] : [190, 170, 18, 200];
                            render_outlined_indicator(screen_center_x, base_yaw, "SAFE", color);
                            base_yaw += 15;
                        }

                        var are_we_preferring_bodyaim = UI.GetValue("Rage", rbot_weapon_types[converted_ragebot_type], "Accuracy", "Prefer body aim");
                        var bodyaim_forced = UI.IsHotkeyActive("Rage", "GENERAL", "General", "Force body aim");

                        if (are_we_preferring_bodyaim || bodyaim_forced) {
                            var color = bodyaim_forced ? [77.5, 186, 10, 200] : [190, 170, 18, 200];
                            render_outlined_indicator(screen_center_x, base_yaw, "BODY", color);
                            base_yaw += 15;
                        }

                        var resolver_override_active = UI.IsHotkeyActive("Rage", "GENERAL", "General", "Resolver override");
                        if (resolver_override_active) {
                            render_outlined_indicator(screen_center_x, base_yaw, "OVERRIDE", [77.5, 186, 10, 200]);
                            base_yaw += 15;
                        }
                    }
                }
                if (script_config.indicator_picks & (1 << 1)) {
                    var color = script_config.autowall_active || script_config.autowall_mode == 2 ? [77.5, 186, 10, 200] : (script_config.autowall_mode == 0 ? [190, 170, 18, 200] : [255, 25, 30, 200]);
                    render_outlined_indicator(screen_center_x, base_yaw, "AW", color);
                    base_yaw += 15;
                }
                if (script_config.indicator_picks & (1 << 2)) {
                    var fake_yaw = Local.GetFakeYaw();
                    var real_yaw = Local.GetRealYaw();
                    var diff = Math.round(angle_diff(fake_yaw, real_yaw));
                    var abs_diff = Math.abs(diff);
                    var text = "AA " + abs_diff.toString();
                    if (script_config.legitaa_lby_mode == 1 && script_config.legitaa_juke_active) {
                        text += " (JUKE)";
                    }
                    var abs_clamped_diff = clamp(abs_diff, 0, 60);
                    var proper_col = aa_shit_color(abs_clamped_diff, 200);
                    render_outlined_indicator(screen_center_x, base_yaw, text, proper_col);
                    base_yaw += 15;

                    var current_fake_side = indicator_dir; //Actually real side but w/e
                    var screen_center_y = screensize[1] * 0.5;
                    var screen_side_top = screensize[1] * 0.495;
                    var screen_side_bottom = screensize[1] * 0.505;

                    switch (current_fake_side) {
                        case -1:
                            var right_front = screensize[0] * 0.541;
                            var right_end = screensize[0] * 0.535;

                            Render.Polygon([
                                [right_front, screen_center_y],
                                [right_end, screen_side_bottom],
                                [right_end, screen_side_top]
                            ], proper_col);
                            break;
                        case 1:
                            var left_front = screensize[0] * 0.459;
                            var left_end = screensize[0] * 0.465;

                            Render.Polygon([
                                [left_end, screen_side_bottom],
                                [left_front, screen_center_y],
                                [left_end, screen_side_top]
                            ], proper_col);
                    }
                }
                if (script_config.indicator_picks & (1 << 3)) {
                    var color = aa_shit_color((get_choked_ticks_for_entity(local) / 16) * 60, 200);
                    render_outlined_indicator(screen_center_x, base_yaw, "FL", color);
                    base_yaw += 15;
                }
                if (script_config.indicator_picks & (1 << 4)) {
                    var text = (script_config.rbot_active ? "RAGE" : "LEGIT");
                    var col = script_config.rbot_active ? [135, 50, 168, 200] : [39, 214, 202, 200];
                    render_outlined_indicator(screen_center_x, base_yaw, text, col);
                }
                if (script_config.indicator_picks & (1 << 5)) {
                    var enemies = Entity.GetEnemies();
                    var enemy_arr_length = enemies.length;
                    var col = script_config.indicator_enemy_side_col;
                    for (var i = 0; i < enemy_arr_length; i++) {
                        if (Entity.IsValid(enemies[i]) && Entity.IsAlive(enemies[i]) && !Entity.IsDormant(enemies[i]) && !Entity.IsBot(enemies[i])) //Of course a bot cannot desync lol
                        {
                            //var enemy_choked_ticks = get_choked_ticks_for_entity(enemies[i]);
                            //if(enemy_choked_ticks < 1)
                            //{
                            // continue;
                            //}
                            var enemy_freestanding_result = handle_edge_detection(enemies[i], 30);
                            if (enemy_freestanding_result == 0) {
                                continue;
                            }
                            var render_box = Entity.GetRenderBox(enemies[i]);
                            if (render_box[0] == false) {
                                continue;
                            }
                            var center_of_bbox_x = render_box[3] - render_box[1];
                            center_of_bbox_x /= 2;
                            center_of_bbox_x += render_box[1];
                            var text = "EST. REAL DIR: " + (enemy_freestanding_result == 1 ? "LEFT" : "RIGHT");
                            Render.String(center_of_bbox_x, render_box[2] - 25, 1, text, col, 2);
                        }
                    }
                }
            }


            if (script_config.indicator_picks & (1 << 7) && Input.IsKeyPressed(0x09)) //Tab
            {
                var base_x = screensize[0] * 0.85;
                var base_y = screensize[1] * 0.65;
                Render.StringCustom(base_x, base_y, 1, "MM Data", [255, 255, 255, 255], watermark_font);
                base_y += 15;
                var players = Entity.GetPlayers();
                var player_arr_length = players.length;
                if (player_arr_length > 0) {
                    for (var i = 0; i < player_arr_length; i++) {
                        if (Entity.IsValid(players[i])) {
                            var player_name = Entity.GetName(players[i]);
                            var player_win_amt = Entity.GetProp(players[i], "CCSPlayerResource", "m_iCompetitiveWins");
                            var player_rank = mm_ranks[Entity.GetProp(players[i], "CCSPlayerResource", "m_iCompetitiveRanking")];
                            var is_bot = Entity.IsBot(players[i]);
                            if (is_bot) {
                                player_name = "BOT " + player_name;
                            }
                            var final_string = player_name + " | Wins: " + player_win_amt.toString() + " | Rank: " + player_rank;
                            Render.StringCustom(base_x, base_y, 1, final_string, [255, 255, 255, 255], watermark_font);
                            base_y += 15;
                        }
                    }
                }
            }
        }
        if (script_config.indicator_picks & (1 << 6)) //gay watermark
        {
            var server_ip = World.GetServerString();
            var are_we_ingame = server_ip != "" && Entity.IsValid(local);
            if (server_ip == "valve") {
                server_ip = "valve ds"
            }
            if (server_ip == "local server") {
                server_ip = "127.0.0.1";
            }
            var accent_color = script_config.indicator_watermark_accent_col;
            var watermark_nickname = Cheat.GetUsername();
            var watermark_string = "crackhook.js | user: " + watermark_nickname;
            if (are_we_ingame) {
                var kills = Entity.GetProp(local, "CPlayerResource", "m_iKills");
                var deaths = Entity.GetProp(local, "CPlayerResource", "m_iDeaths");

                var kd_ratio = deaths == 0 ? kills : (kills / deaths);
                var kd_string = kd_ratio.toFixed(2);

                watermark_string += (" | kills: " + kills + " | deaths: " + deaths + " | k/d: " + kd_string + " | host: " + server_ip);
            }
            var string_size = Render.TextSizeCustom(watermark_string, watermark_font);
            Render.GradientRect(screensize[0] * 0.99 - string_size[0], 8, string_size[0] + 10, 20, 1, [0, 0, 0, 150], [0, 0, 0, 100]);
            Render.StringCustom(screensize[0] * 0.99 - string_size[0] + 5, 11, 0, watermark_string, accent_color, watermark_font);
            Render.GradientRect(screensize[0] * 0.99 - string_size[0], 27, string_size[0] + 10, 3, 1, accent_color, [accent_color[0] * 0.75, accent_color[1] * 0.75, accent_color[2] * 0.75, accent_color[3] * 0.75]);
        }
    }
}

//Legitbot stuff begins about here. Get ready for bad code.
function scan_targets(targeting_mode, min_damage, max_fov, should_baim) //Kinda sad I can't really scan backtrack records using Onetap's API. Especially not with me using the ragebot.
{
    var local_eyepos = Entity.GetEyePosition(local);
    var local_viewangles = Local.GetViewAngles();
    var hitboxes = [];

    var allowed_hitboxes = script_config.rbot_allowed_hitboxes;
    if (should_baim) {
        allowed_hitboxes &= ~(1 << 0);
    }
    var enemies = Entity.GetEnemies();
    var enemy_len = enemies.length;
    if (enemy_len == 0) {
        return {
            pos: [0, 0, 0],
            fov: -1
        };
    }
    var best_fov = 999;
    var target = -1;
    var temp_tgt_hitboxes = [];
    for (var i = 0; i < enemy_len; i++) {
        if (Entity.IsValid(enemies[i]) && Entity.IsAlive(enemies[i]) && !Entity.IsDormant(enemies[i])) {
            var hitbox_arr = [];
            for (var j = 0; j <= 18; j++) {
                if (allowed_hitboxes & (1 << get_ragebot_hitgroup_for_hitbox(j))) {
                    var hitbox = Entity.GetHitboxPosition(enemies[i], j);
                    if (typeof(hitbox) == "undefined") {
                        continue;
                    }
                    hitbox_arr.push({
                        hb: hitbox,
                        index: j
                    });
                }
            }
            var hitbox_arr_len = hitbox_arr.length;
            for (var k = 0; k < hitbox_arr_len; k++) {
                var angle_to_hitbox = calculate_angle(local_eyepos, hitbox_arr[k].hb, local_viewangles);
                var fov = Math.hypot(angle_to_hitbox[0], angle_to_hitbox[1]);
                if (best_fov > fov) {
                    best_fov = fov;
                    target = enemies[i];
                    temp_tgt_hitboxes = hitbox_arr;
                }
            }
        }
    }
    if (target == -1 || best_fov > max_fov) {
        return {
            pos: [0, 0, 0],
            fov: -1
        };
    }
    hitboxes = temp_tgt_hitboxes;

    best_fov = 999; //reset fov

    var target_health = Entity.GetProp(target, "CBasePlayer", "m_iHealth"); //Used for hp override
    var proper_min_damage = target_health * (min_damage / 100); //lololo
    var best_hitbox_pos = [0, 0, 0];
    var legit_autowall_active = script_config.autowall_mode == 0; //if its full autowall who cars anyway
    var normal_autowall_active = script_config.autowall_mode == 2 || script_config.autowall_active;
    var hitboxes_visible = 0; //For legit autowall

    var hitbox_arr_length = hitboxes.length;
    var best_damage = -1;
    for (var i = 0; i < hitbox_arr_length; i++) {
        var hitbox = hitboxes[i];
        var angle_to_hitbox = calculate_angle(local_eyepos, hitbox.hb, local_viewangles);
        var fov = Math.hypot(angle_to_hitbox[0], angle_to_hitbox[1]);
        if (max_fov > fov) {
            var trace = Trace.Bullet(local, target, local_eyepos, hitbox.hb);
            var damage = trace[1];
            var visible = trace[2];
            if (visible) {
                hitboxes_visible++;
            }
            if ((targeting_mode == 0 ? (best_fov > fov) : (damage > best_damage)) && (visible || normal_autowall_active || (legit_autowall_active && hitboxes_visible > 0)) && damage > proper_min_damage) {
                best_damage = damage;
                best_fov = fov;
                best_hitbox_pos = hitbox.hb;
                if (best_damage > target_health + (proper_min_damage * 0.5)) {
                    break;
                }
            }
        }
    }
    return {
        pos: best_hitbox_pos,
        fov: best_fov
    }; //gamer moment
}

function smooth_out_aim(original_angle, aimangle, factor) {
    var new_aimangle = vector_div_fl(aimangle, factor);
    var return_angle = vector_add(original_angle, new_aimangle);
    return normalize_angle(return_angle);
}

function do_rcs(aimangle, rcs_pitch, rcs_yaw) //I was really sleepy when I wrote this.
{
    var local_punch_angle = Entity.GetProp(local, "CBasePlayer", "m_aimPunchAngle");
    var recoil_scale = Convar.GetFloat("weapon_recoil_scale");
    var fixed_recoil = vector_mul_fl(local_punch_angle, recoil_scale);

    fixed_recoil[0] *= rcs_pitch;
    fixed_recoil[1] *= rcs_yaw;

    var finished_rcs = vector_sub(aimangle, fixed_recoil);

    return normalize_angle(finished_rcs);
}

var last_legitbot_kill_time = 0.0;

function do_legitbot() {
    if (Globals.Curtime() > (last_legitbot_kill_time + script_config.lbot_kill_delay)) {
        var flash_amt = Entity.GetProp(local, "CCSPlayer", "m_flFlashDuration");
        if (flash_amt != 0) {
            return;
        }
        var local_viewangles = Local.GetViewAngles();
        var local_eyepos = Entity.GetEyePosition(local);
        var aimangle = do_rcs(local_viewangles, script_config.lbot_rcs_x, script_config.lbot_rcs_y);
        var current_weapon_category = get_weapon_for_config();
        if (current_weapon_category == -1) {
            return;
        }
        var current_rage_weapon_category = convert_weapon_index_into_rbot_idx(current_weapon_category);
        var current_ragebot_fov = UI.GetValue("Rage", rbot_weapon_types[current_rage_weapon_category], "Targeting", "FOV"); //What's the point of the legitbot having it's own FOV?

        var target = scan_targets(script_config.lbot_tgt_select, script_config.lbot_mindmg, current_ragebot_fov, current_rage_weapon_category == 4);
        if (target.fov != -1 && target.fov != 999) {
            var selected_smoothing = target.fov < current_ragebot_fov / 4 ? (Math.max(script_config.lbot_smooth * 0.75 * Math.min(Globals.Frametime() / Globals.TickInterval(), 1), 1)) : (script_config.lbot_smooth * Math.min(Globals.Frametime() / Globals.TickInterval(), 1));
            var angle_to_tgt = calculate_angle(local_eyepos, target.pos, aimangle);
            aimangle = smooth_out_aim(aimangle, angle_to_tgt, selected_smoothing);
            Local.SetViewAngles(aimangle);
        }
    }
}

function on_move() {
    local = Entity.GetLocalPlayer();
    if (script_config.script_active) {
        var current_weapon_category = get_weapon_for_config();
        if (current_weapon_category != -1) {
            var current_rage_weapon_category = convert_weapon_index_into_rbot_idx(current_weapon_category);
            UI.SetValue("Rage", rbot_weapon_types[current_rage_weapon_category], "Targeting", "Hitboxes", 0); //Just in case. (this might have been the bug that caused it to autowall lol) (doing it in createmove callback because why not, also it seems to be buggy otherwise)
        }
        setup_config_and_dyn_fov();
        handle_legitaa();
        if (script_config.rbot_active) //Yet another gamer move
        {
            handle_autowall();
        }
        if (script_config.lbot_active && !script_config.rbot_active) {
            do_legitbot();
        }
        handle_fakelag();
    }
}

var last_direction_switch = 0;

function on_draw() {
    update_settings();
    handle_visibility();
    handle_indicators();
    if (last_direction_switch + 0.3 < Globals.Curtime()) {
        current_proper_direction = handle_edge_detection(local, 15);
        last_direction_switch = Globals.Curtime();
    }
} //Can't be arsed setting up a FSN callback for all the misc shit and doing it in Draw doesn't seem to be a bad choice, seeing as it's called once-per-frame.

//Gay killsay territory
var normal_killsays = ["ez", "too fucking easy", "effortless", "easiest kill of my life",
    "retard blasted", "cleans?", "nice memesense retard", "hello mind explaining what happened there",
    "pounce out of your window disgusting tranny, you shouldnt exist in this world",
    "lmao ur so ugly irl like bro doesnt it hurt to live like that, btw you know you can just end it all",
    "ROFL NICE *DEAD* HHHHHHHHHHHHHHHHHH", "take the cooldown and let your team surr retard",
    "go take some estrogen tranny", "uid police here present your user identification number right now",
    "nice chromosome count you sell??", "nice thirdworldspeak ROFL"
];

var hs_killsays = ["ez", "effortless", "1", "nice antiaim, you sell?", "you pay for that?",
    "refund right now", "consider suicide", "bro are u clean?",
    "another retard blasted",
    "hhhhhhhhhhhhhhhhhh 1, you pay for that? refund so maybe youll afford some food for your family thirdworld monkey",
    "paster abandoned the match and received a 7 day competitive matchmaking cooldown",
    "freeqn.net/refund.php", "refund your rainbowhook right now pasteuser dog",
    "140er????", "get good get vantap4ik",
    "1 but all you need to fix your problems is a rope and a chair you ugly shit",
    "who (kto) are you (nn4ik) wattafak mens???????", "must be an uid issue", "holy shit consider refunding your trash paste rofl",
    "hello please refund your subpar product",
    "thats going in my media compilation right there get shamed retard rofl",
    "imagine the only thing you eat being bullets man being a thirdworlder must suck rofl", "so fucking ez", "bot_kick", "where the enemies at????"
];


//I hope you haven't gotten cancer after reading those

function on_player_death() {
    var victim = Entity.GetEntityFromUserID(Event.GetInt("userid"));
    var attacker = Entity.GetEntityFromUserID(Event.GetInt("attacker"));
    if (script_config.trashtalk) {
        var headshot = Event.GetInt("headshot") == 1;
        if (attacker == local && attacker != victim) {
            var normal_say = normal_killsays[Math.floor(Math.random() * normal_killsays.length)];
            var hs_say = hs_killsays[Math.floor(Math.random() * hs_killsays.length)];

            if (headshot && Math.floor(Math.random() * 3) <= 2) //gamer style randomizer
            {
                Cheat.ExecuteCommand("say " + hs_say);
                return;
            }
            Cheat.ExecuteCommand("say " + normal_say);
        }
    }
    if (local == attacker && Entity.IsEnemy(victim)) {
        last_legitbot_kill_time = Globals.Curtime();
    }
}

//if they shoot us they better be ready for da OTTOBALL
function on_player_hurt() {
    var attacker = Entity.GetEntityFromUserID(Event.GetInt("attacker"));
    var victim = Entity.GetEntityFromUserID(Event.GetInt("userid"));
    if (local == victim && Event.GetInt("health") > 0 && Entity.IsEnemy(attacker)) {
        players_who_hurt_us.push({
            cisgendered_pig: attacker,
            time_he_hurt_us: Globals.Curtime()
        }); //How dare he hurt our precious trans selves? (youre playing semirage youre probably taking estrogen)
    }
}

function on_round_start() //Clean up our shit.
{
    players_who_hurt_us.splice(0, players_who_hurt_us.length);
    ragebot_targets_this_round.splice(0, ragebot_targets_this_round.length);
    last_peek = 0.0;
    last_direction_switch = 0.0;
    last_legitbot_kill_time = 0.0;
}

function on_ragebot_fire() {
    var target_index = Event.GetInt("target_index");
    ragebot_targets_this_round.push({
        aimbot_target: target_index,
        shot_time: Globals.Curtime()
    });
    if (script_config.rage_shot_log) {
        var target_name = Entity.GetName(target_index);
        var hitbox = Event.GetInt("hitbox");
        var hitbox_name = get_hitbox_name(hitbox);
        var hitchance = Event.GetInt("hitchance");
        var safety = Event.GetInt("safepoint");
        var safety_string = safety == 1 ? "ON" : "OFF";
        var local_eyepos = Entity.GetEyePosition(local);
        var target_hitboxpos = Entity.GetHitboxPosition(target_index, hitbox);
        var hitbox_string = "";
        if (typeof(target_hitboxpos) != "undefined") {
            var trace = Trace.Bullet(local, target_index, local_eyepos, target_hitboxpos);
            var damage = trace[1];
            var visibility = trace[2];
            hitbox_string = " ( predicted damage: \x0C" + damage + " \x01, center of hitbox visible: \x0C" + visibility + " \x01)";
        }
        var final_string = " \x03[crackhook] \x01fired at \x04" + target_name + " \x01into \x04" + hitbox_name + " \x01with hitchance \x0C" + hitchance + " \x01( safety status: \x02" + safety_string + " \x01)" + hitbox_string;
        Cheat.PrintChat(final_string);
    }
}

function on_unload() {
    AntiAim.SetOverride(0); //i hate having aa override left on
}

function setup_callbacks() {
    //Function callbacks + unload callback
    Cheat.RegisterCallback("CreateMove", "on_move");
    Cheat.RegisterCallback("Draw", "on_draw");
    Cheat.RegisterCallback("Unload", "on_unload");
    //Event callbacks
    Cheat.RegisterCallback("player_death", "on_player_death");
    Cheat.RegisterCallback("player_hurt", "on_player_hurt");
    Cheat.RegisterCallback("ragebot_fire", "on_ragebot_fire");
    Cheat.RegisterCallback("round_start", "on_round_start");
}

setup_callbacks();

//disable fake lag when using r8 revolver

UI.AddCheckbox("Prevent R8 fire when using fakelag");

function check() {
    if (UI.GetValue("Misc", "JAVASCRIPT", "Script items", "Prevent R8 fire when using fakelag")) {
        LagFix();
    }
}

function LagFix() {
    player = Entity.GetLocalPlayer();
    weapon = Entity.GetWeapon(player);
    weaponName = Entity.GetName(weapon);
    if (weaponName.includes("r8 revolver")) {
        UI.SetValue("Anti-Aim", "Fake-Lag", "Enabled", false)
    } else {
        UI.SetValue("Anti-Aim", "Fake-Lag", "Enabled", true)
    }
}

Global.RegisterCallback("Draw", "check");

//autostrafe 
UI.AddCheckbox("Autostrafe");
var a = UI.AddSliderInt("Turn speed", 200, 500)

function d() {
    if (UI.GetValue("Autostrafe")) {
        UI.SetValue("Misc", "GENERAL", "Movement", " Autostrafe turn speed", UI.GetValue.apply(null, a))
    }
}
Cheat.RegisterCallback("Draw", "d")

//vote reveal in game
UI.AddCheckbox("Vote revealer");
var options = []

function onVoteOptions() {
    options[0] = Event.GetString("option1")
    options[1] = Event.GetString("option2")
    options[2] = Event.GetString("option3")
    options[3] = Event.GetString("option4")
    options[4] = Event.GetString("option5")
}

function onVoteCast() {
    if (UI.GetValue("Vote revealer")) {
        var entid = Event.GetInt("entityid");
        if (entid) {
            var team = Event.GetInt("team");
            var option = Event.GetInt("vote_option");
            var name = Entity.GetName(entid);
            var chTeam = "null";
            switch (team) {
                case 0:
                    chTeam = "[N] ";
                    break;
                case 1:
                    chTeam = "[S] ";
                    break;
                case 2:
                    chTeam = "[T] ";
                    break;
                case 3:
                    chTeam = "[CT] ";
                    break;
                default:
                    chTeam = "[UNK] ";
                    break;
            }

            var vote = options[option];
            Global.PrintColor([217, 217, 217, 255], "[crackhook] \0");
            Global.Print(chTeam + name + " voted " + vote + "\n");
            Global.PrintChat(chTeam + name + " voted " + vote);
        }
    }
}
Global.RegisterCallback("vote_options", "onVoteOptions");
Global.RegisterCallback("vote_cast", "onVoteCast");

//clantags
var lasttime = 0;
var customtext = 0;

function time_to_ticks(time) {
    var timer = time / Globals.TickInterval() + .5;
    return timer;
}
var old_text_anim = 0;

function anim(texta, indices) {
    if (!World.GetServerString()) return;
    if (UI.GetValue("MISC", "JAVASCRIPT", "Script items", "Custom clantags")) {
        text_anim = "               " + texta + "                      ";
    } else {
        text_anim = "  ";
    }
    tickinterval = Globals.TickInterval();
    tickcount = Globals.Tickcount() + time_to_ticks(Local.Latency());
    ddd = tickcount / time_to_ticks(0.2);
    ddd = ddd % indices.length;
    ddd = indices[parseInt(ddd)] + 1;
    text_anim = text_anim.slice(ddd, ddd + 30);
    if (text_anim != old_text_anim) {
        Local.SetClanTag(text_anim);
    }
    old_text_anim = text_anim;
}

function clantag() {
    var clantag = UI.GetValue("MISC", "JAVASCRIPT", "Script items", "Custom clantags");
    if (clantag == 1) {
        customtext = "gamesense";
    }
    if (clantag == 2) {
        customtext = "onetap.su";
    }
    if (clantag == 3) {
        customtext = "hdf.service";
    }
    if (clantag == 4) {
        customtext = "owo.services";
    }
    if (clantag == 5) {
        customtext = "aquaholic";
    }
    if (clantag == 6) {
        customtext = "memesense";
    }
    if (clantag == 7) {
        customtext = "semiraging";
    }
    if (clantag == 8) {
        customtext = Cheat.GetUsername();
    }
    if (clantag == 9) {
        customtext = "nixware.cc";
    }
    if (clantag == 10) {
        customtext = "TrapSync";
    }
    anim(customtext, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 11, 11, 11, 11, 11, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
}
UI.AddDropdown("Custom clantags", ["off", "gamesense", "onetap.su", "hdf", "OwO", "aquaholic", "memesense", "semiraging", Cheat.GetUsername(), "nixware.cc", "TrapSync"]);
Cheat.RegisterCallback("Draw", "clantag");

//min dmg override
UI.AddCheckbox("Display mindmg indicator")
UI.AddHotkey("Heavy Pistol Override")
UI.AddSliderInt("Heavy Pistol Mindmg", 0, 130)
UI.AddHotkey("Scout Override")
UI.AddSliderInt("Scout Mindmg", 0, 130)
UI.AddHotkey("AWP Override")
UI.AddSliderInt("AWP Mindmg", 0, 130)
UI.AddHotkey("Auto Override")
UI.AddSliderInt("Auto Mindmg", 0, 130)

var heavy_cache = UI.GetValue("Rage", "HEAVY PISTOL", "Targeting", "Minimum damage")
var scout_cache = UI.GetValue("Rage", "SCOUT", "Targeting", "Minimum damage")
var awp_cache = UI.GetValue("Rage", "AWP", "Targeting", "Minimum damage")
var auto_cache = UI.GetValue("Rage", "AUTOSNIPER", "Targeting", "Minimum damage")

function isActive(a) {
    return UI.IsHotkeyActive("Script items", a)
}

function setValue(cat, value) {
    UI.SetValue("Rage", cat.toUpperCase(), "Targeting", "Minimum damage", value)
}

function isHeavyPistol(name) {
    if (name == "r8 revolver" || name == "desert eagle") {
        return true
    }
}

function isAutoSniper(name) {
    if (name == "scar 20" || weapon_name == "g3sg1") {
        return true
    }
}

function onCM() {
    heavy_value = UI.GetValue("Script items", "Heavy Pistol Mindmg")
    scout_value = UI.GetValue("Script items", "Scout Mindmg")
    awp_value = UI.GetValue("Script items", "AWP Mindmg")
    auto_value = UI.GetValue("Script items", "Auto Mindmg")
    weapon_name = Entity.GetName(Entity.GetWeapon(Entity.GetLocalPlayer()))

    if (isActive("Heavy Pistol Override") && isHeavyPistol(weapon_name)) {
        setValue("HEAVY PISTOL", heavy_value)
    } else {
        setValue("HEAVY PISTOL", heavy_cache)
    }

    if (isActive("Scout Override") && weapon_name == "ssg 08") {
        setValue("SCOUT", scout_value)
    } else {
        setValue("SCOUT", scout_cache)
    }

    if (isActive("AWP Override") && weapon_name == "awp") {
        setValue("AWP", awp_value)
    } else {
        setValue("AWP", awp_cache)
    }

    if (isActive("Auto Override") && isAutoSniper(weapon_name)) {

        setValue("AUTOSNIPER", auto_value)
    } else {
        setValue("AUTOSNIPER", auto_cache)
    }

}

function indicator() {
    font = Render.AddFont("Tahoma", 17, 600)
    screen = Render.GetScreenSize()
    wep = Entity.GetName(Entity.GetWeapon(Entity.GetLocalPlayer()))
    x = screen[0] - screen[0] + 20
    y = screen[1] - 100
    heavy = "" + UI.GetValue("Rage", "HEAVY PISTOL", "Targeting", "Minimum damage")
    scout = "" + UI.GetValue("Rage", "SCOUT", "Targeting", "Minimum damage")
    awp = "" + UI.GetValue("Rage", "AWP", "Targeting", "Minimum damage")
    auto = "" + UI.GetValue("Rage", "AUTOSNIPER", "Targeting", "Minimum damage")
    var str = ""
    if (UI.GetValue("Script items", "Display indicator") && Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
        if (isHeavyPistol(wep)) {
            str = heavy
        } else if (wep == "ssg 08") {
            str = scout
        } else if (wep == "awp") {
            str = awp
        } else if (isAutoSniper(wep)) {
            str = auto
        }
    }

    if (str == "" + 0) {
        str = "DYNAMIC"
    }
    Render.StringCustom(x + 1, y + 1, 0, str + "", [0, 0, 0, 255], font)
    Render.StringCustom(x, y, 0, str + "", [255, 255, 255, 255], font)
}
Cheat.RegisterCallback("Draw", "indicator")
Cheat.RegisterCallback("CreateMove", "onCM")


//better slow-walk
UI.AddHotkey("Better slow-walk:");

UI.AddSliderInt("Speed:", 0, 135);

UI.AddCheckbox("Individual better slow-walk speeds:", 0, 135);

UI.AddSliderInt("Forward speed:", 0, 135);
UI.AddSliderInt("Side speed:", 0, 135);
UI.AddSliderInt("Back speed:", 0, 135);


function getVal(valName) {
    return UI.GetValue("Misc", "JAVASCRIPT", "Script items", valName);
}

function cMove() {
    //forward, side, up.
    if (!UI.IsHotkeyActive("Misc", "JAVASCRIPT", "Script items", "Better slow-walk:")) return;

    speed = getVal("Speed:");

    fSpeed = speed;
    bSpeed = speed;
    sSpeed = speed;

    if (getVal("Individual better slow-walk speeds:")) {
        fSpeed = getVal("Forward speed:");
        bSpeed = getVal("Back speed:");
        sSpeed = getVal("Side speed:");
    }

    dir = [0, 0, 0];

    if (Input.IsKeyPressed(0x57)) {
        //'W' AKA Forward
        dir[0] += fSpeed;
    }
    if (Input.IsKeyPressed(0x44)) {
        //'D' AKA Right
        dir[1] += sSpeed;
    }
    if (Input.IsKeyPressed(0x41)) {
        //'A' AKA Left
        dir[1] -= sSpeed;
    }
    if (Input.IsKeyPressed(0x53)) {
        //'S' AKA Back
        dir[0] -= bSpeed;
    }

    UserCMD.SetMovement(dir);
}

Cheat.RegisterCallback("CreateMove", "cMove");
//buylist made by LeoDeveloper and Motonized#6495
/*
(c) Copyright LeoDeveloper 2020 - 2021
Released under the MIT license at https://leodeveloper.pages.dev
Visit https://leodeveloper.pages.dev/license.html for more information.
Developed by the one and only LeoDeveloper and Monotonized#6495
*/
UI.AddCheckbox("Enable enemy buylist");
var COLORNAMES,
    COLORS,
    PRINTABLE,
    _,
    display_icons,
    drag,
    draw,
    enemycache,
    exceptions,
    i,
    in_warmup,
    index,
    key,
    len,
    moving,
    onDraw,
    on_cs_game_disconnected,
    on_item_equip,
    on_item_pickup,
    on_item_remove,
    on_player_death,
    position,
    priorities,
    priority_array,
    rel_start,
    screen,
    value,
    weapon,
    weaponcache,
    weaponname_icons

screen = Render.GetScreenSize()

UI.AddSliderInt("loadout_x", 0, screen[0])
UI.SetEnabled("loadout_x", false);
UI.AddSliderInt("loadout_y", 0, screen[1])
UI.SetEnabled("loadout_y", false);

position = [UI.GetValue("loadout_x"), UI.GetValue("loadout_y")]

if (!position[0]) {
    position[0] = screen[0] - 200
}

if (!position[1]) {
    position[1] = screen[1] / 2 - 100
}

moving = false

PRINTABLE = /[a-zA-Z0-9!"#$%&'()*+,-.\/:;<=>?@[\\\]^_`{|}~]/
COLORNAMES = ['Yellow', 'Purple', 'Green', 'Blue', 'Orange']

// Colors taken from : https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/engine/baseclientstate.cpp#L56
// && https://github.com/perilouswithadollarsign/cstrike15_src/blob/f82112a2388b841d72cb62ca48ab1846dfcc11c8/game/shared/shareddefs.h
COLORS = [
    [240, 243, 32, 255],
    [190, 33, 222, 255],
    [28, 166, 0, 255],
    [92, 168, 255, 255],
    [255, 155, 37, 255],
]
COLOR_CT = [153, 204, 255, 255]
COLOR_T = [255, 178, 70, 255]
DARKENCOLORS = [
    [128, 130, 7, 255],
    [95, 16, 111, 255],
    [13, 83, 0, 255],
    [0, 80, 173, 255],
    [146, 79, 0, 255],
]

display_icons = {
    'glock 18': 'd',
    p2000: 'o',
    'dual berettas': 'b',
    p250: 'y',
    'five seven': 'c',
    'cz75 auto': 'Q',
    'usp s': 'P',
    'desert eagle': 'a',
    'r8 revolver': 'R',
    'tec 9': 'w',
    nova: 'B',
    xm1014: 'r',
    'mag 7': 't',
    'sawed off': 'v',
    negev: 'u',
    m249: 'i',
    mp9: 'A',
    mp7: 'z',
    'mp5 sd': 'p',
    'ump 45': 'q',
    p90: 'C',
    'pp bizon': 's',
    'mac 10': 'n',
    'ak 47': 'e',
    m4a4: 'l',
    'm4a1 s': 'm',
    famas: 'h',
    'galil ar': 'k',
    aug: 'f',
    'ssg 08': 'F',
    'sg 553': 'E',
    awp: 'g',
    'scar 20': 'D',
    g3sg1: 'j',
    'high explosive grenade': 'I',
    'smoke grenade': 'J',
    flashbang: 'H',
    'decoy grenade': 'L',
    molotov: 'K',
    'incendiary grenade': 'M',
    'zeus x27': 'x',
    'c4 explosive': 'N',
    'm9 bayonet': 'G',
    bayonet: 'G',
    'flip knife': 'G',
    'gut knife': 'G',
    karambit: 'G',
    'butterfly knife': 'G',
    'falchion knife': 'G',
    'navaja knife': 'G',
    'shadow daggers': 'G',
    'stiletto knife': 'G',
    'bowie knife': 'G',
    'huntsman knife': 'G',
    'talon knife': 'G',
    'ursus knife': 'G',
    'classic knife': 'G',
    'paracord knife': 'G',
    'survival knife': 'G',
    'nomad knife': 'G',
    'skeleton knife': 'G',
    knife: 'G',
    defuse_kit: 'U',
    c4: 'N',
    kevlar: 'S',
    kelvar_helmet: 'T',
}

exceptions = {
    'glock 18': 'glock',
    p2000: 'hkp2000',
    'dual berettas': 'elite',
    'cz75 auto': 'cz75a',
    'usp s': 'usp_silencer',
    'desert eagle': 'deagle',
    'r8 revolver': 'revolver',
    'pp bizon': 'bizon',
    'high explosive grenade': 'hegrenade',
    'decoy grenade': 'decoy',
    'incendiary grenade': 'incgrenade',
    'zeus x27': 'taser',
}

weaponname_icons = {}

for (key in display_icons) {
    value = display_icons[key]
    weaponname_icons['weapon_' + (exceptions[key] ? exceptions[key] : key.replace(/ /g, ''))] = value
}

// ARMOR KNIFE TASER NADES PISTOL OTHER KIT BOMB -> Old Order
// Newer Order : ARMOR TASER NADES PISTOL KNIFE OTHER KIT BOMB
priority_array = [
    [display_icons.kevlar, display_icons.kelvar_helmet],
    [display_icons['zeus x27']],
    [display_icons.molotov, display_icons['incendiary grenade']],
    [display_icons['high explosive grenade']],
    [display_icons['smoke grenade']],
    [display_icons.flashbang],
    [display_icons['decoy grenade']],
    [display_icons['glock 18'], display_icons.p2000, display_icons['dual berettas'], display_icons.p250, display_icons['five seven'], display_icons['cz75 auto'], display_icons['usp s'], display_icons['desert eagle'], display_icons['r8 revolver'], display_icons['tec 9']],
    [display_icons.knife],
    [],
    [display_icons.defuse_kit],
    [display_icons.c4],
]

priorities = {}

for (_ in display_icons) {
    weapon = display_icons[_]
    priorities[weapon] = 9
}

for (index in priority_array) {
    value = priority_array[index]
    for (i = 0, len = value.length; i < len; i++) {
        weapon = value[i]
        priorities[weapon] = index
    }
}

weaponcache = {}

enemycache = {}

draw = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        var active, enemies, font, height, icon, icons, j, k, l, len1, len2, len3, len4, m, money, name, player, ref, results, size, width, customColor
        if (!(Entity.IsValid(Entity.GetLocalPlayer()) || UI.IsMenuOpen())) {
            return
        }
        font = Render.AddFont('Segoe UI', 8, 600)
        height = 0
        // upper header
        // header

        Render.GradientRect(position[0], position[1], 100, 2, 1, [218, 160, 87, 255], [255, 223, 150, 255])
        Render.GradientRect(position[0] + 100, position[1], 100, 2, 1, [255, 223, 150, 255], [218, 160, 87, 255])
        Render.FilledRect(position[0], position[1] + 2, 200, 16, [38, 40, 52, 90])
        /*
        Render.GradientRect(position[0], position[1], 100, 2, 1, 
            (Entity.GetProp(Entity.GetLocalPlayer(), 'CCSPlayer', 'm_iTeamNum') === 2 ? COLOR_CT : COLOR_T),
            (Entity.GetProp(Entity.GetLocalPlayer(), 'CCSPlayer', 'm_iTeamNum') === 3 ? COLOR_CT : COLOR_T))
        Render.GradientRect(position[0] + 100, position[1], 100, 2, 1, 
            (Entity.GetProp(Entity.GetLocalPlayer(), 'CCSPlayer', 'm_iTeamNum') === 3 ? COLOR_CT : COLOR_T),
            (Entity.GetProp(Entity.GetLocalPlayer(), 'CCSPlayer', 'm_iTeamNum') === 2 ? COLOR_CT : COLOR_T))
        Render.FilledRect(position[0], position[1] + 2, 200, 16, 
                            [38, 40, 52, 90])*/
        text = 'loadout '
        if (Entity.GetProp(Entity.GetLocalPlayer(), 'CCSPlayer', 'm_iTeamNum') === 2) text = text + '( CT )'
        else if (Entity.GetProp(Entity.GetLocalPlayer(), 'CCSPlayer', 'm_iTeamNum') === 3) text = text + '( T )'

        //+ (Entity.GetProp(Entity.GetGameRulesProxy(), "CCSGameRulesProxy" ,"m_bIsValveDS") == 1 ? " (valve) " : " ")
        size = Render.TextSizeCustom(text, font)
        Render.StringCustom(position[0] + (200 - size[0]) / 2 + 1, position[1] + (18 - size[1]) / 2 + 1, 0, text, [0, 0, 0, 100], font)
        Render.StringCustom(position[0] + (200 - size[0]) / 2, position[1] + (18 - size[1]) / 2, 0, text, [239, 239, 239, 255], font)
        enemies = Entity.GetEnemies()
        for (j = 0, len1 = enemies.length; j < len1; j++) {
            player = enemies[j]
            enemycache[player] = true
        }
        for (player in enemycache) {
            _ = enemycache[player]
            player = parseInt(player) // keys always string
            if (enemies.indexOf(player) === -1 && Entity.IsEnemy(player)) {
                // just to be sure
                enemies.push(player)
            }
        }
        results = []
        for (k = 0, len2 = enemies.length; k < len2; k++) {
            player = enemies[k]
            if (!(Entity.GetProp(player, 'CCSPlayerResource', 'm_iHealth') > 0)) {
                continue
            }
            if (!Entity.IsDormant(player)) {
                icons = []
                ref = Entity.GetWeapons(player)
                for (l = 0, len3 = ref.length; l < len3; l++) {
                    weapon = ref[l]
                    icon = display_icons[Entity.GetName(weapon)]
                    if (icon) {
                        icons.push(icon)
                    }
                }
                if (icons.indexOf(display_icons[Entity.GetName(Entity.GetWeapon(player))]) >= 0) {
                    // JANK PROTECTION
                    weaponcache[player] = {
                        weapons: icons,
                        selected: display_icons[Entity.GetName(Entity.GetWeapon(player))],
                    }
                }
            }
            name = Entity.GetName(player)
            if (!PRINTABLE.exec(name)) {
                if (Entity.GetProp(player, 'CCSPlayerResource', 'm_iCompTeammateColor') >= 0) name = 'Enemy ' + COLORNAMES[Entity.GetProp(player, 'CCSPlayerResource', 'm_iCompTeammateColor')]
                else name = 'Enemy Player'
            }

            if (Entity.IsBot(player)) {
                name = 'BOT ' + name
            }

            width = 0
            customColor = [239, 239, 239, 255]
            if (!Entity.IsBot(player) && Entity.GetProp(player, 'CCSPlayerResource', 'm_iCompTeammateColor') >= 0) {
                customColor = COLORS[Entity.GetProp(player, "CCSPlayerResource", "m_iCompTeammateColor")]
                customCircleColor = DARKENCOLORS[Entity.GetProp(player, "CCSPlayerResource", "m_iCompTeammateColor")]
                //customColor = COLORS[k], customCircleColor = DARKENCOLORS[k]
                Render.FilledCircle(position[0] + 8, position[1] + height + 26, 4, customColor)
                Render.Circle(position[0] + 8, position[1] + height + 26, 4, customCircleColor)
                width = +18
            }

            Render.StringCustom(position[0] + width + 4, position[1] + height + 21, 0, name, [0, 0, 0, 100], font)
            Render.StringCustom(position[0] + width + 3, position[1] + height + 20, 0, name, [239, 239, 239, 255], font)
            width = width + Render.TextSizeCustom(name, font)[0]
            //
            money = Entity.GetProp(player, 'CCSPlayer', 'm_iAccount') + '$'
            Render.StringCustom(position[0] + width + 11, position[1] + height + 21, 0, money, [0, 0, 0, 100], font)
            Render.StringCustom(position[0] + width + 10, position[1] + height + 20, 0, money, [0, 144, 81, 255], font)
            //
            /*
    location = "; " + Entity.GetProp(player, "CCSPlayer", "m_szLastPlaceName")
    width    =  width + Render.TextSizeCustom(money, font)[0];
    Render.StringCustom(position[0] + width + 16, position[1] + height + 19, 0, location, [0, 0, 0, 100], font);
    Render.StringCustom(position[0] + width + 15, position[1] + height + 18, 0, location, [233, 233, 233, 255], font);*/
            //
            width = 0
            icons = weaponcache[player] ? weaponcache[player].weapons.slice() : []
            if (Entity.GetProp(player, 'CCSPlayer', 'm_bHasHelmet')) {
                icons.push(display_icons.kelvar_helmet)
            } else if (Entity.GetProp(player, 'CCSPlayerResource', 'm_iArmor') > 0) {
                icons.push(display_icons.kevlar)
            }
            if (Entity.GetProp(player, 'CCSPlayer', 'm_bHasDefuser')) {
                icons.push(display_icons.defuse_kit)
            }
            icons.sort(function(a, b) {
                return priorities[a] - priorities[b]
            })

            active = weaponcache[player] ? weaponcache[player].selected : void 0
            for (m = 0, len4 = icons.length; m < len4; m++) {
                icon = icons[m]
                if (icon === "G" && icon !== active) continue; // filter out knives
                Render.String(position[0] + width + 2, position[1] + height + 36, 0, icon, [0, 0, 0, 100], 5)
                Render.String(position[0] + width + 1, position[1] + height + 35, 0, icon, active === icon ? [255, 164, 1, 255] : [239, 239, 239, 255], 5)
                width += Render.TextSize(icon, 5)[0]

            }
            results.push((height += 36)) // was 32, changed to adapt filledcircle
        }
        return results
    }
}
rel_start = void 0

drag = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        var cursor, rel
        if (!(UI.IsMenuOpen() && Input.IsKeyPressed(0x01))) {
            return (rel_start = void 0)
        }
        cursor = Input.GetCursorPosition()
        rel = [cursor[0] - position[0], cursor[1] - position[1]]
        if (!rel_start && (rel[0] < 0 || rel[0] > 200 || rel[1] < 0 || rel[1] > 18)) {
            return
        }
        if (!rel_start) {
            rel_start = rel
        }
        position = [cursor[0] - rel_start[0], cursor[1] - rel_start[1]]
        UI.SetValue("loadout_x", position[0])
        return UI.SetValue("loadout_y", position[1])
    }
}
in_warmup = false

onDraw = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        if (Entity.GetProp(Entity.GetGameRulesProxy(), 'CCSGameRulesProxy', 'm_bWarmupPeriod')) {
            in_warmup = true
        } else if (in_warmup) {
            enemycache = {}
            weaponcache = {}
            in_warmup = false
        }
        drag()
        return draw()
    }
}
on_item_pickup = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        var player
        player = Entity.GetEntityFromUserID(Event.GetInt('userid'))
        if (!Entity.IsEnemy(player)) {
            return
        }
        weapon = weaponname_icons['weapon_' + Event.GetString('item')]
        if (!weapon) {
            return
        }
        if (!weaponcache[player]) {
            weaponcache[player] = {
                weapons: [],
                selected: void 0,
            }
        }
        return weaponcache[player].weapons.push(weapon)
    }
}
on_item_remove = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        var player
        player = Entity.GetEntityFromUserID(Event.GetInt('userid'))
        if (!(weaponcache[player] && Entity.IsEnemy(player))) {
            return
        }
        weapon = weaponname_icons['weapon_' + Event.GetString('item')]
        if (!weapon) {
            return
        }
        index = weaponcache[player].weapons.indexOf(weapon)
        if (index >= 0) {
            return weaponcache[player].weapons.splice(index, 1)
        }
    }
}
on_item_equip = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        var player
        player = Entity.GetEntityFromUserID(Event.GetInt('userid'))
        if (!(weaponcache[player] && Entity.IsEnemy(player))) {
            return
        }
        weapon = weaponname_icons['weapon_' + Event.GetString('item')]
        if (!weapon) {
            return
        }
        return (weaponcache[player].selected = weapon)
    }
}
on_player_death = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        var player
        player = Entity.GetEntityFromUserID(Event.GetInt('userid'))
        if (!(weaponcache[player] && Entity.IsEnemy(player))) {
            return
        }
        return (weaponcache[player] = {
            weapons: [],
            selected: void 0,
        })
    }
}
on_cs_game_disconnected = function() {
    if (UI.GetValue("Enable enemy buylist")) {
        enemycache = {}
        return (weaponcache = {})
    }
}

Cheat.RegisterCallback('Draw', 'onDraw')
Cheat.RegisterCallback('item_pickup', 'on_item_pickup')
Cheat.RegisterCallback('item_remove', 'on_item_remove')
Cheat.RegisterCallback('item_equip', 'on_item_equip')
Cheat.RegisterCallback('player_death', 'on_player_death')
Cheat.RegisterCallback('cs_game_disconnected', 'on_cs_game_disconnected')

//FPS boost (pasted from my script legithelper.js)
UI.AddCheckbox("FPS boost");

function fpsBoost() {
    if (UI.GetValue("FPS boost")) {
        //Auto turn on stock otc3's performance boosting features. Delete if you don't want to do so.
        UI.SetValue("Misc", "GENERAL", "Misc", "Force sv_cheats", true);
        UI.SetValue("Misc", "GENERAL", "Misc", "Hidden cvars", true);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable post processing", true);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable fog", true);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable shadows", true);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable blood", true);
        //set convars
        Convar.SetString("r_shadows", "0");
        Convar.SetString("cl_csm_static_prop_shadows", "0");
        Convar.SetString("cl_csm_shadows", "0");
        Convar.SetString("cl_csm_world_shadows", "0");
        Convar.SetString("cl_foot_contact_shadows", "0");
        Convar.SetString("cl_csm_viewmodel_shadows", "0");
        Convar.SetString("cl_csm_rope_shadows", "0");
        Convar.SetString("cl_csm_sprite_shadows", "0");
        Convar.SetString("cl_csm_world_shadows_in_viewmodelcascade", "0");
        Convar.SetString("cl_csm_translucent_shadows", "0");
        Convar.SetString("cl_csm_entity_shadows", "0");
        Convar.SetString("violence_hblood", "0");
        Convar.SetString("r_3dsky", "0");
        Convar.SetString("r_drawdecals", "0");
        Convar.SetString("r_drawrain", "0");
        Convar.SetString("r_drawropes", "0");
        Convar.SetString("r_drawsprites", "0");
        Convar.SetString("fog_enable", "0");
        Convar.SetString("fog_enable_water_fog", "0");
        Convar.SetString("fog_enableskybox", "0");
        Convar.SetString("@panorama_disable_blur", "1");
        Convar.SetString("dsp_slow_cpu", "1");
        Convar.SetString("cl_disable_ragdolls", "1");
        Convar.SetString("mat_disable_bloom", "1");
    } else {
        //Auto turn off stock otc3's performance boosting features. Delete if you don't want to do so.
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable post processing", false);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable fog", false);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable shadows", false);
        UI.SetValue("Misc", "PERFORMANCE & INFORMATION", "Performance", "Disable blood", false);
        //reset convars
        Convar.SetString("r_shadows", "1");
        Convar.SetString("cl_csm_static_prop_shadows", "1");
        Convar.SetString("cl_csm_shadows", "1");
        Convar.SetString("cl_csm_world_shadows", "1");
        Convar.SetString("cl_foot_contact_shadows", "1");
        Convar.SetString("cl_csm_viewmodel_shadows", "1");
        Convar.SetString("cl_csm_rope_shadows", "1");
        Convar.SetString("cl_csm_sprite_shadows", "1");
        Convar.SetString("cl_csm_world_shadows_in_viewmodelcascade", "1");
        Convar.SetString("cl_csm_translucent_shadows", "1");
        Convar.SetString("cl_csm_entity_shadows", "1");
        Convar.SetString("violence_hblood", "1");
        Convar.SetString("r_3dsky", "1");
        Convar.SetString("r_drawdecals", "1");
        Convar.SetString("r_drawrain", "1");
        Convar.SetString("r_drawropes", "1");
        Convar.SetString("r_drawsprites", "1");
        Convar.SetString("fog_enable", "1");
        Convar.SetString("fog_enable_water_fog", "1");
        Convar.SetString("fog_enableskybox", "1");
        Convar.SetString("@panorama_disable_blur", "0");
        Convar.SetString("dsp_slow_cpu", "0");
        Convar.SetString("cl_disable_ragdolls", "0");
        Convar.SetString("mat_disable_bloom", "0");
    }
}

Global.RegisterCallback("Draw", "fpsBoost")

//Dump rank + wins (pasted from my script legithelper.js)
UI.AddCheckbox("Dump Ranks + Wins");
UI.AddDropdown("Rank Dump Team", ['T', 'CT', 'All']);

if (Convar.GetString("cl_detail_max_sway") == 5) {
    Cheat.PrintColor([255, 255, 255, 255], ("["));
    Cheat.PrintColor([60, 255, 60, 255], ("SCRIPT"));
    Cheat.PrintColor([255, 255, 255, 255], ("] By"));
    Cheat.PrintColor([255, 60, 60, 255], (" Zero Two \n"));
    Convar.SetString("cl_detail_max_sway", "5.1");
}

var mm_ranks = ["NO RANK", "S1", "S2", "S3", "S4", "SE", "SEM",
    "GN1", "GN2", "GN3", "GNM",
    "MG1", "MG2", "MGE", "DMG",
    "LE", "LEM", "SMFC", "Global"
];

function drawtochat() {
    if (UI.GetValue("Script Items", "Dump Ranks + Wins")) {
        if (UI.GetValue("Script Items", "Rank Dump Team") == 2) {
            for (i = 0; i < Entity.GetPlayers().length; i++) {
                if (Entity.GetProp(Entity.GetPlayers()[i], "CBaseEntity", "m_iTeamNum") == 2) {
                    Cheat.PrintChat("\x01[\x04crackhook\x01] \x10" +
                        Entity.GetName(Entity.GetPlayers()[i]) +
                        " \x01HAS \x03" +
                        Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveWins") +
                        "\x01 WINS (\x02" +
                        mm_ranks[Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveRanking")] +
                        "\x01)");
                }
            }
            for (i = 0; i < Entity.GetPlayers().length; i++) {
                if (Entity.GetProp(Entity.GetPlayers()[i], "CBaseEntity", "m_iTeamNum") == 3) {
                    Cheat.PrintChat("\x01[\x04crackhook\x01] \x0B" +
                        Entity.GetName(Entity.GetPlayers()[i]) +
                        " \x01HAS \x03" +
                        Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveWins") +
                        "\x01 WINS (\x02" +
                        mm_ranks[Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveRanking")] +
                        "\x01)");
                }
            }
        }
        if (UI.GetValue("Script Items", "Rank Dump Team") == 1) {
            for (i = 0; i < Entity.GetPlayers().length; i++) {
                if (Entity.GetProp(Entity.GetPlayers()[i], "CBaseEntity", "m_iTeamNum") == 3) {
                    Cheat.PrintChat("\x01[\x04crackhook\x01] \x0B" +
                        Entity.GetName(Entity.GetPlayers()[i]) +
                        " \x01HAS \x03" +
                        Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveWins") +
                        "\x01 WINS (\x02" +
                        mm_ranks[Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveRanking")] +
                        "\x01)");
                }
            }
        }
        if (UI.GetValue("Script Items", "Rank Dump Team") == 0) {
            for (i = 0; i < Entity.GetPlayers().length; i++) {
                if (Entity.GetProp(Entity.GetPlayers()[i], "CBaseEntity", "m_iTeamNum") == 2) {
                    Cheat.PrintChat("\x01[\x04crackhook\x01] \x10" +
                        Entity.GetName(Entity.GetPlayers()[i]) +
                        " \x01HAS \x03" +
                        Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveWins") +
                        "\x01 WINS (\x02" +
                        mm_ranks[Entity.GetProp(Entity.GetPlayers()[i], "CCSPlayerResource", "m_iCompetitiveRanking")] +
                        "\x01)");
                }
            }
        }

        UI.SetValue("Script Items", "Dump Ranks + Wins", false)
    }
}

Global.RegisterCallback("Draw", "drawtochat")