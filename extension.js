/* Copyright (C) 2017 Tom Hartill

Based on the original Workspace Indicator code found in the stock Gnome Shell
Extensions extension set.

extension.js - Part of the Workspace Indicator Plus Gnome Shell Extension.

Workspace Indicator Plus is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by the Free
Software Foundation; either version 3 of the License, or (at your option) any
later version.

Workspace Indicator Plus is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
details.

You should have received a copy of the GNU General Public License along with
Workspace Indicator Plus; if not, see http://www.gnu.org/licenses/.

An up to date version can also be found at:
https://github.com/Tomha/gnome-shell-extension-workspace-indicator-plus */

const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;

const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

// TODO: Font still needs to auto-align center ?
// TODO: Need to size background image
// TODO: Prefs UI needs workspace section
// TODO: Customise left/right click behaviour - list/overview/custom overview?

function hexToRgbaString (hex) {
    let string = 'rgba(';
    string += parseInt(hex.slice(1,3), 16).toString() + ','
    string += parseInt(hex.slice(3,5), 16).toString() + ','
    string += parseInt(hex.slice(5,7), 16).toString() + ','
    string += (parseInt(hex.slice(7,9), 16) / 255).toString() + ')'
    return string;
}

function WorkspaceIndicator() {
    this._init();
}

WorkspaceIndicator.prototype = {
    _createWorkspacesSection: function () {
	    this._workspaceSection.removeAll();
	    this._workspaceMenuItems = [];
	    this._currentWorkspace = global.screen.get_active_workspace().index();

	    for(let i = 0; i < global.screen.n_workspaces; i++) {
	        let newMenuItem = new PopupMenu.PopupMenuItem(Meta.prefs_get_workspace_name(i));
	        newMenuItem.workspaceId = i;
	        newMenuItem.label_actor = this._label;

	        this._workspaceMenuItems.push(newMenuItem);
	        this._workspaceSection.addMenuItem(newMenuItem);
	        this._workspaceMenuItems[i].connect('activate',
	            Lang.bind(this, function(actor, event) {
		            this._setWorkspace(actor.workspaceId);
	            }));

	        if (i == this._currentWorkspace)
		        this._workspaceMenuItems[i].setOrnament(PopupMenu.Ornament.DOT);
	    }

	    this._updateLabelText();
    },

    _getDesktopBackgroundUri: function () {
        let fullUri = this._desktopSettings.get_string('picture-uri');
        let uri = fullUri.split(':')[1].replace('%20', ' '); // too crude?
        return uri;
    },

    _setWorkspace: function (index) {
	    if(index >= 0 && index <  global.screen.n_workspaces) {
	        let workspace = global.screen.get_workspace_by_index(index);
	        workspace.activate(global.get_current_time());
	    }
    },

    _updateIndicator: function () {
	    this._workspaceMenuItems[this._currentWorkspace].setOrnament(
	        PopupMenu.Ornament.NONE);
	    this._currentWorkspace = global.screen.get_active_workspace().index();
	    this._workspaceMenuItems[this._currentWorkspace].setOrnament(
	        PopupMenu.Ornament.DOT);
	    this._updateLabelText();
    },

    _updateLabelStyle: function () {
        let style = 'text-align:center;vertical-align:middle;'
        if(!this._useAutomaticHeight) style += 'min-height:' + this._height.toString() + 'px;';
        if(!this._useAutomaticWidth) style += 'min-width:' + this._width.toString() + 'px;';
        if(!this._useShellTextColour) style += 'color:' + hexToRgbaString(this._textColour) + ';';
        if(!this._useShellTextSize) style += 'font-size:' + this._textSize.toString() + 'pt;';
        style += 'padding:' + this._verticalPadding.toString() + 'px ' + this._horizontalPadding.toString() + 'px;';
        style += 'border:' + this._borderWidth.toString() + 'px solid ' + hexToRgbaString(this._borderColour) + ';';
        if(this._backgroundStyle == 0)
            style += 'background-color:' + hexToRgbaString(this._backgroundColour) + ';';
        else
            style += 'background-image:url(\"' + this._getDesktopBackgroundUri() + '\");';
        this._label.set_style(style);
    },

    _updateLabelText: function () {
        switch(this._textStyle) {
            case 0:
                this._label.set_text(Meta.prefs_get_workspace_name(this._currentWorkspace));
                break;
            case 1:
                this._label.set_text((this._currentWorkspace + 1).toString());
                break;
            case 2:
                this._label.set_text((this._currentWorkspace + 1).toString() + '/' + global.screen.n_workspaces.toString());
                break;
        }
    },

    // Settings
    _loadSettings: function () {
        this._backgroundColour = this._settings.get_string('background-colour');
        this._backgroundStyle = this._settings.get_enum('background-style');
        this._borderColour = this._settings.get_string('border-colour');
        this._borderWidth = this._settings.get_int('border-width');
        this._height = this._settings.get_int('height');
        this._horizontalPadding = this._settings.get_int('horizontal-padding');
        this._index = this._settings.get_int('index');
        this._position = this._settings.get_enum('position');
        this._textColour = this._settings.get_string('text-colour');
        this._textSize = this._settings.get_int('text-size');
        this._textStyle = this._settings.get_enum('text-style');
        this._useAutomaticHeight = this._settings.get_boolean('use-automatic-height');
        this._useAutomaticWidth = this._settings.get_boolean('use-automatic-width');
        this._useShellTextColour = this._settings.get_boolean('use-shell-text-colour');
        this._useShellTextSize = this._settings.get_boolean('use-shell-text-size');
        this._verticalPadding = this._settings.get_int('vertical-padding');
        this._width = this._settings.get_int('width');
    },

    _onSettingsChanged: function (settings, key) {
        switch(key) {
            case 'background-colour':
                this._backgroundColour = this._settings.get_string('background-colour');
                this._updateLabelStyle();
                break;
            case 'background-style':
                this._backgroundStyle = this._settings.get_enum('background-style');
                this._updateLabelStyle();
                break;
            case 'border-colour':
                this._borderColour = this._settings.get_string('border-colour');
                this._updateLabelStyle();
                break;
            case 'border-width':
                this._borderWidth = this._settings.get_int('border-width');
                this._updateLabelStyle();
                break;
            case 'height':
                this._height = this._settings.get_int('height');
                this._updateLabelStyle();
                break;
            case 'horizontal-padding':
                this._horizontalPadding = this._settings.get_int('horizontal-padding');
                this._updateLabelStyle();
                break;
            case 'index':
                this._index = this._settings.get_int('index');
                this.disable();
                this.enable();
                break;
            case 'position':
                this._position = this._settings.get_enum('position');
                this.disable();
                this.enable();
                break;
            case 'text-colour':
                this._textColour = this._settings.get_string('text-colour');
                this._updateLabelStyle();
                break;
            case 'text-size':
                this._textSize = this._settings.get_int('text-size');
                this._updateLabelStyle();
                break;
            case 'text-style':
                this._textStyle = this._settings.get_enum('text-style');
                this._updateLabelText();
                break;
            case 'use-automatic-height':
                this._useAutomaticHeight = this._settings.get_boolean('use-automatic-height');
                this._updateLabelStyle();
                break;
            case 'use-automatic-width':
                this._useAutomaticWidth = this._settings.get_boolean('use-automatic-width');
                this._updateLabelStyle();
                break;
            case 'use-shell-text-colour':
                this._useShellTextColour = this._settings.get_boolean('use-shell-text-colour');
                this._updateLabelStyle();
                break;
            case 'use-shell-text-size':
                this._useShellTextSize = this._settings.get_boolean('use-shell-text-size');
                this._updateLabelStyle();
                break;
            case 'vertical-padding':
                this._verticalPadding = this._settings.get_int('vertical-padding');
                this._updateLabelStyle();
                break;
            case 'width':
                this._width = this._settings.get_int('width');
                this._label.set_text('');
                this._updateLabelStyle();
                this._updateLabelText();
                break;
        }
    },

    // Event Handler Functions
    _onButtonScrolled: function (button, event) {
        let scrollDirection = event.get_scroll_direction();
        let direction = 0;
        if (scrollDirection == Clutter.ScrollDirection.DOWN) direction = 1;
        else if (scrollDirection == Clutter.ScrollDirection.UP) direction = -1;
        else return;
        let index = global.screen.get_active_workspace().index() + direction;
        if (index == global.screen.n_workspaces) index = 0;
        else if (index == -1) index = global.screen.n_workspaces - 1;
        this._setWorkspace(index);
    },

    // Gnome Shell Functions
    _init: function () { },

    enable: function () {
        this._currentWorkspace = global.screen.get_active_workspace().index();

        this._settings = Settings.getSettings();
        this._settingsSignal = this._settings.connect('changed', Lang.bind(this, this._onSettingsChanged));
        this._loadSettings();

        this._desktopSettings = Settings.getSettings('org.gnome.desktop.background');
        this._desktopSettingsSignal = this._desktopSettings.connect('changed', Lang.bind(this, function (settings, key) {
            if (key == 'picture-uri') this._updateLabelStyle();
        }));

        // Create button with label
        this._label = new St.Label({y_align: Clutter.ActorAlign.CENTER});
        this._updateLabelStyle();
        this._button = new PanelMenu.Button(0.0, "Workspace Indicator");
        this._button.actor.add_actor(this._label);
        this._button.actor.connect('scroll-event',
                                   Lang.bind(this, this._onButtonScrolled));

        this._updateLabelText();

        // Populate workspace menu
        this._workspaceMenuItems = [];
	    this._workspaceSection = new PopupMenu.PopupMenuSection();
	    this._button.menu.addMenuItem(this._workspaceSection);
	    this._createWorkspacesSection();

	    // Connect signals
	    this._screenSignals = [];
	    this._screenSignals.push(global.screen.connect_after(
	        'workspace-added',
	        Lang.bind(this, this._createWorkspacesSection)));
	    this._screenSignals.push(global.screen.connect_after(
	        'workspace-removed',
	        Lang.bind(this, this._createWorkspacesSection)));
	    this._screenSignals.push(global.screen.connect_after(
	        'workspace-switched',
	        Lang.bind(this, this._updateIndicator)));

        this._workspaceSettings = Settings.getSettings("org.gnome.desktop.wm.preferences");
        this._workspaceSettingsSignal = this._workspaceSettings.connect('changed', Lang.bind(this, this._createWorkspacesSection));

        // Add the button to the panel
        Main.panel.addToStatusArea('workspace-indicator-plus', this._button, -1);
    },

    disable: function () {
        this._currentWorkspace = null;
        for (let i = 0; i < this._screenSignals.length; i++)
	        global.screen.disconnect(this._screenSignals[i]);

        this._settings.disconnect(this._settingsSignal);
        this._workspaceSettings.disconnect(this._workspaceSettingsSignal);

        this._workspaceSection.destroy();
        this._label.destroy();
        this._button.destroy();
    }
};

function init() {
    return new WorkspaceIndicator();
}
