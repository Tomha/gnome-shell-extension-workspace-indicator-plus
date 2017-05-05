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
https://github.com/Tomha/gnome-shell-extension-workspeed-indicator-plus */

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

function hexColourToRgb (hexValue) {
    let colourArray = [];
    colourArray.push(parseInt(hexValue.slice(1,3), 16).toString());
    colourArray.push(parseInt(hexValue.slice(3,5), 16).toString());
    colourArray.push(parseInt(hexValue.slice(5,7), 16).toString());
    return colourArray;
}

function WorkspaceIndicator() {
    this._init();
}

WorkspaceIndicator.prototype = {
    _createWorkspaceName: function (index) {
        if(index == null) index = this._currentWorkspace;
        if(this._useNames) return Meta.prefs_get_workspace_name(index);
        else return (index + 1).toString();
    },

    _createWorkspacesSection: function () {
	    this._workspaceSection.removeAll();
	    this._workspaceMenuItems = [];
	    this._currentWorkspace = global.screen.get_active_workspace().index();

	    for(let i = 0; i < global.screen.n_workspaces; i++) {
	        let newMenuItem = new PopupMenu.PopupMenuItem(this._createWorkspaceName(i));
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

	    this._label.set_text(this._createWorkspaceName());
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
	    this._label.set_text(this._createWorkspaceName());
    },

    _updateLabelStyle: function () {
        let style = '';
        let backgroundColour = hexColourToRgb(this._fillColour);
        style += 'background-color: rgba(';
        style += backgroundColour[0] + ', ';
        style += backgroundColour[1] + ',';
        style += backgroundColour[2] + ',';
        style += this._fillTransparency.toString() + ');';
        let borderColour = hexColourToRgb(this._borderColour);
        style += 'border:';
        style += this._borderWidth.toString() + 'px solid rgba(';
        style += borderColour[0] + ',';
        style += borderColour[1] + ',';
        style += borderColour[2] + ',';
        style += this._borderTransparency.toString() + ');';
        style += 'padding:' + this._verticalPadding + 'px ' + this._horizontalPadding + 'px;';
        if(!this._useTextDefault) style += 'color:' + this._textColour + 'px;';
        if(this._useFixedWidth) style += 'width:' + this._fixedWidth + 'px;';
        this._label.set_style(style);
    },

    // Settings
    _loadSettings: function () {
        this._borderColour = this._settings.get_string('border-colour');
        this._borderTransparency = this._settings.get_double('border-transparency');
        this._borderWidth = this._settings.get_int('border-width');
        this._fillColour = this._settings.get_string('fill-colour');
        this._fillTransparency = this._settings.get_double('fill-transparency');
        this._fixedWidth = this._settings.get_int('fixed-width');
        this._horizontalPadding = this._settings.get_int('horizontal-padding');
        this._index = this._settings.get_int('index');
        this._position = this._settings.get_int('position');
        this._textColour = this._settings.get_string('text-colour');
        this._useFixedWidth = this._settings.get_boolean('use-fixed-width');
        this._useNames = this._settings.get_boolean('use-names');
        this._useTextDefault = this._settings.get_boolean('use-text-default');
        this._useWorkspaceThumbnails = this._settings.get_boolean('use-workspace-thumbnails');
        this._verticalPadding = this._settings.get_int('vertical-padding');
    },

    _onSettingsChanged: function (settings, key) {
        switch(key) {
            case 'border-colour':
                this._borderColour = this._settings.get_string('border-colour');
                this._updateLabelStyle();
                break;
            case 'border-transparency':
                this._borderTransparency = this._settings.get_double('border-transparency');
                this._updateLabelStyle();
                break;
            case 'border-width':
                this._borderWidth = this._settings.get_int('border-width');
                this._updateLabelStyle();
                break;
            case 'fill-colour':
                this._fillColour = this._settings.get_string('fill-colour');
                this._updateLabelStyle();
                break;
            case 'fill-transparency':
                this._fillTransparency = this._settings.get_double('fill-transparency');
                this._updateLabelStyle();
                break;
            case 'fixed-width':
                this._fixedWidth = this._settings.get_int('fixed-width');
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
                this._position = this._settings.get_int('position');
                this.disable();
                this.enable();
                break;
            case 'text-colour':
                this._textColour = this._settings.get_string('text-colour');
                this._updateLabelStyle();
                break;
            case 'use-fixed-width':
                this._useFixedWidth = this._settings.get_boolean('use-fixed-width');
                this._updateLabelStyle();
                break;
            case 'use-names':
                this._useNames = this._settings.get_boolean('use-names');
                this._createWorkspacesSection();
                break;
            case 'use-text-default':
                this._useTextDefault = this._settings.get_boolean('use-text-default');
                this._updateLabelStyle();
                break;
            case 'use-workspace-thumbnails':
                this._useWorkspaceThumbnails = this._settings.get_boolean('use-workspace-thumbnails');
                // TODO: Workspace thumbnails
                break;
            case 'vertical-padding':
                this._verticalPadding = this._settings.get_int('vertical-padding');
                this._updateLabelStyle();
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

        // Create button with label
        this._label = new St.Label({y_align: Clutter.ActorAlign.CENTER});
        this._updateLabelStyle();
        this._button = new PanelMenu.Button(0.0, "Workspace Indicator");
        this._button.actor.add_actor(this._label);
        this._button.actor.connect('scroll-event',
                                   Lang.bind(this, this._onButtonScrolled));

        this._label.set_text(this._createWorkspaceName());

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

        this._workspaceSection.destroy();
        this._label.destroy();
        this._button.destroy();
    }
};

function init() {
    return new WorkspaceIndicator();
}
