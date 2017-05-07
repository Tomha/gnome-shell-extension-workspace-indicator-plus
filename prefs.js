/* Copyright (C) 2017 Tom Hartill

Based on the original Workspace Indicator code found in the stock Gnome Shell
Extensions extension set.

prefs.js - Part of the Workspace Indicator Plus Gnome Shell Extension.

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

const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

function hexToRgba (hex) {
    let colour = new Gdk.RGBA();
    colour.red = parseInt(hex.slice(1,3), 16) / 255;
    colour.green = parseInt(hex.slice(3,5), 16) / 255;
    colour.blue = parseInt(hex.slice(5,7), 16) / 255;
    colour.alpha = parseInt(hex.slice(7,9), 16) / 255;
    return colour;
}

function rgbaToHex (rgba) {
    let red = (parseInt(rgba.red * 255)).toString(16);
    if (red.length == 1) red = "0" + red;
    let green = (parseInt(rgba.green * 255)).toString(16);
    if (green.length == 1) green = "0" + green;
    let blue = (parseInt(rgba.blue * 255)).toString(16);
    if (blue.length == 1) blue = "0" + blue;
    let alpha = (parseInt(rgba.alpha * 255)).toString(16);
    if (alpha.length == 1) alpha = "0" + alpha;
    return "#" + red + green + blue + alpha;
}

function WorkspaceIndicatorPrefs () {
    this._init();
}

WorkspaceIndicatorPrefs.prototype = {
    _init: function () {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(Me.path + '/prefs.ui');
        this.widget = this._builder.get_object('notebook');

        this._settings = Settings.getSettings();

        this._populateAppearance();
        this._populateAbout();

        this._builder.connect_signals_full(Lang.bind(this, this._signalConnector));
    },

    _populateAbout: function () {
        let name = this._builder.get_object('nameLabel');
        name.set_text(Me.metadata['name'].toString());

        let about = this._builder.get_object('aboutLabel');
        about.set_text(Me.metadata['description'].toString());

        let version = this._builder.get_object('versionLabel');
        version.set_text(Me.metadata['version'].toFixed(1).toString());

        let website = this._builder.get_object('websiteLabel');
        website.set_markup('<a href="' + Me.metadata['url'].toString() + '">' +
           Me.metadata['name'].toString() + '</a>');

        let licence = this._builder.get_object('licenceLabel');
        licence.set_markup('<span font="10">' +
            'This extension comes with absolutely no warranty.\n' +
            'See the <a href="' +
            Me.metadata['licence-url'].toString() + '">' +
            Me.metadata['licence'].toString() + '</a>' +
            ' or later for details.</span>');
    },

    _populateAppearance : function () {
        let widget = value = null;

        // Border Colour
        widget = this._builder.get_object('borderColour');
        value = this._settings.get_string('border-colour');
        widget.set_rgba(hexToRgba(value));

        // Border Width
        widget = this._builder.get_object('borderWidth');
        value = this._settings.get_int('border-width');
        widget.set_value(value);

        // Background Colour
        widget = this._builder.get_object('backgroundColour');
        value = this._settings.get_string('background-colour');
        widget.set_rgba(hexToRgba(value));

        // Background Style
        value = this._settings.get_enum('background-style');
        switch (value) {
            case 0:
                widget = this._builder.get_object('backgroundStyleColour')
                break;
            case 1:
                widget = this._builder.get_object('backgroundStyleImage')
                break;
        }
        widget.set_active(true);

        // Text Colour
        widget = this._builder.get_object('textColour');
        value = this._settings.get_string('text-colour');
        widget.set_rgba(hexToRgba(value));

        // Text Size
        widget = this._builder.get_object('textSize');
        value = this._settings.get_int('text-size');
        widget.set_value(value);

        // Text Style
        value = this._settings.get_enum('text-style');
        switch (value) {
            case 0:
                widget = this._builder.get_object('textStyleName')
                break;
            case 1:
                widget = this._builder.get_object('textStyleNumber')
                break;
            case 2:
                widget = this._builder.get_object('textStyleNumberTotal')
        }
        widget.set_active(true);

        // Width
        widget = this._builder.get_object('width');
        value = this._settings.get_int('width');
        widget.set_value(value);

        // Height
        widget = this._builder.get_object('height');
        value = this._settings.get_int('height');
        widget.set_value(value);

        // Vertical Padding
        widget = this._builder.get_object('verticalPadding');
        value = this._settings.get_int('vertical-padding');
        widget.set_value(value);

        // Horizontal Padding
        widget = this._builder.get_object('horizontalPadding');
        value = this._settings.get_int('horizontal-padding');
        widget.set_value(value);

        // Use Shell Text Colour
        widget = this._builder.get_object('useShellTextColour');
        value = this._settings.get_boolean('use-shell-text-colour');
        widget.set_active(value);

        // Use Shell Text Size
        widget = this._builder.get_object('useShellTextSize');
        value = this._settings.get_boolean('use-shell-text-size');
        widget.set_active(value);

        // Use Automatic Width
        widget = this._builder.get_object('useAutomaticWidth');
        value = this._settings.get_boolean('use-automatic-width');
        widget.set_active(value);

        // Use Automatic Height
        widget = this._builder.get_object('useAutomaticHeight');
        value = this._settings.get_boolean('use-automatic-height');
        widget.set_active(value);
    },

    _signalConnector: function (builder, object, signal, handler) {
        object.connect(signal, Lang.bind(this, this._signalHandler[handler]));
    },

    _signalHandler: {
        borderColourChanged: function (button) {
            let value = rgbaToHex(button.get_rgba());
            this._settings.set_string('border-colour', value);
            this._settings.apply();
        },

        borderWidthChanged: function (spinButton) {
            let value = spinButton.get_value_as_int();
            this._settings.set_int('border-width', value);
            this._settings.apply();
        },

        backgroundColourChanged: function (button) {
                    let debug = this._builder.get_object('debug');
            debug.set_text('test');
            let value = rgbaToHex(button.get_rgba());
            this._settings.set_string('background-colour', value);
            this._settings.apply();
        },

        backgroundStyleChanged: function (toggle) {
            if(toggle.get_active()) {
                switch(toggle.get_name()){
                    case "backgroundStyleColour":
                        this._settings.set_enum('background-style', 0);
                        break;
                    case "backgroundStyleImage":
                        this._settings.set_enum('background-style', 1);
                }
            }
            this._settings.apply();
        },

        heightChanged: function (scale) {
            let value = scale.get_value();
            this._settings.set_int('height', value);
            this._settings.apply();
        },

        horizontalPaddingChanged: function (scale) {
            let value = scale.get_value();
            this._settings.set_int('horizontal-padding', value);
            this._settings.apply();
        },

        resetBorderColour: function (button) {
            this._settings.reset('border-colour');
            let widget = this._builder.get_object('borderColour');
            let value = this._settings.get_string('border-colour');
            widget.set_rgba(hexToRgba(value));
        },

        resetBorderWidth: function (button) {
            this._settings.reset('border-width');
            let widget = this._builder.get_object('borderWidth');
            let value = this._settings.get_int('border-width');
            widget.set_value(value);
        },

        resetBackgroundColour: function (button) {
            this._settings.reset('background-colour');
            let widget = this._builder.get_object('backgroundColour');
            let value = this._settings.get_string('background-colour');
            widget.set_rgba(hexToRgba(value));
        },

        resetHeight: function (button) {
            this._settings.reset('height');
            let widget = this._builder.get_object('height');
            let value = this._settings.get_int('height');
            widget.set_value(value);
        },

        resetHorizontalPadding (button) {
            this._settings.reset('horizontal-padding');
            let widget = this._builder.get_object('horizontalPadding');
            let value = this._settings.get_int('horizontal-padding');
            widget.set_value(value);
        },

        resetTextColour: function (button) {
            this._settings.reset('text-colour');
            let widget = this._builder.get_object('textColour');
            let value = this._settings.get_string('text-colour');
            widget.set_rgba(hexToRgba(value));
        },

        resetTextSize: function (button) {
            this._settings.reset('text-size');
            let widget = this._builder.get_object('textSize');
            let value = this._settings.get_int('text-size');
            widget.set_value(value);
        },

        resetVerticalPadding (button) {
            this._settings.reset('vertical-padding');
            let widget = this._builder.get_object('verticalPadding');
            let value = this._settings.get_int('vertical-padding');
            widget.set_value(value);
        },

        resetWidth: function (button) {
            this._settings.reset('width');
            let widget = this._builder.get_object('width');
            let value = this._settings.get_int('width');
            widget.set_value(value);
        },

        textColourChanged: function (button) {
            let value = rgbaToHex(button.get_rgba());
            this._settings.set_string('text-colour', value);
            this._settings.apply();
        },

        textSizeChanged: function (scale) {
            let value = scale.get_value();
            this._settings.set_int('text-size', value);
            this._settings.apply();
        },

        textStyleChanged: function (toggle) {
            if(toggle.get_active()) {
                switch(toggle.get_name()){
                    case "textStyleName":
                        this._settings.set_enum('text-style', 0);
                        break;
                    case "textStyleNumber":
                        this._settings.set_enum('text-style', 1);
                        break;
                    case "textStyleNumberTotal":
                        this._settings.set_enum('text-style', 2);
                }
            }
            this._settings.apply();
        },

        useAutomaticHeightToggled: function (checkbox) {
            let value = checkbox.get_active();
            this._settings.set_boolean('use-automatic-height', value);
            this._settings.apply();
        },

        useAutomaticWidthToggled: function (checkbox) {
            let value = checkbox.get_active();
            this._settings.set_boolean('use-automatic-width', value);
            this._settings.apply();
        },

        useShellTextColourToggled: function (checkbox) {
            let value = checkbox.get_active();
            this._settings.set_boolean('use-shell-text-colour', value);
            this._settings.apply();
        },

        useShellTextSizeToggled: function (checkbox) {
            let value = checkbox.get_active();
            this._settings.set_boolean('use-shell-text-size', value);
            this._settings.apply();
        },

        verticalPaddingChanged: function (scale) {
            let value = scale.get_value();
            this._settings.set_int('vertical-padding', value);
            this._settings.apply();
        },

        widthChanged: function (scale) {
            let value = scale.get_value();
            this._settings.set_int('width', value);
            this._settings.apply();
        },
    }
};

function buildPrefsWidget () {
    prefs = new WorkspaceIndicatorPrefs();
    prefs.widget.show_all();
    return prefs.widget;
}

function init (){ }


/*
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const WORKSPACE_SCHEMA = 'org.gnome.desktop.wm.preferences';
const WORKSPACE_KEY = 'workspace-names';

const WorkspaceNameModel = new GObject.Class({
    Name: 'WorkspaceIndicator.WorkspaceNameModel',
    GTypeName: 'WorkspaceNameModel',
    Extends: Gtk.ListStore,

    Columns: {
        LABEL: 0,
    },

    _init: function(params) {
        this.parent(params);
        this.set_column_types([GObject.TYPE_STRING]);

        this._settings = new Gio.Settings({ schema_id: WORKSPACE_SCHEMA });
        //this._settings.connect('changed::workspace-names', Lang.bind(this, this._reloadFromSettings));

        this._reloadFromSettings();

        // overriding class closure doesn't work, because GtkTreeModel
        // plays tricks with marshallers and class closures
        this.connect('row-changed', Lang.bind(this, this._onRowChanged));
        this.connect('row-inserted', Lang.bind(this, this._onRowInserted));
        this.connect('row-deleted', Lang.bind(this, this._onRowDeleted));
    },

    _reloadFromSettings: function() {
        if (this._preventChanges)
            return;
        this._preventChanges = true;

        let newNames = this._settings.get_strv(WORKSPACE_KEY);

        let i = 0;
        let [ok, iter] = this.get_iter_first();
        while (ok && i < newNames.length) {
            this.set(iter, [this.Columns.LABEL], [newNames[i]]);

            ok = this.iter_next(iter);
            i++;
        }

        while (ok)
            ok = this.remove(iter);

        for ( ; i < newNames.length; i++) {
            iter = this.append();
            this.set(iter, [this.Columns.LABEL], [newNames[i]]);
        }

        this._preventChanges = false;
    },

    _onRowChanged: function(self, path, iter) {
        if (this._preventChanges)
            return;
        this._preventChanges = true;

        let index = path.get_indices()[0];
        let names = this._settings.get_strv(WORKSPACE_KEY);

        if (index >= names.length) {
            // background with blanks
            for (let i = names.length; i <= index; i++)
                names[i] = '';
        }

        names[index] = this.get_value(iter, this.Columns.LABEL);

        this._settings.set_strv(WORKSPACE_KEY, names);

        this._preventChanges = false;
    },

    _onRowInserted: function(self, path, iter) {
        if (this._preventChanges)
            return;
        this._preventChanges = true;

        let index = path.get_indices()[0];
        let names = this._settings.get_strv(WORKSPACE_KEY);
        let label = this.get_value(iter, this.Columns.LABEL) || '';
        names.splice(index, 0, label);

        this._settings.set_strv(WORKSPACE_KEY, names);

        this._preventChanges = false;
    },

    _onRowDeleted: function(self, path) {
        if (this._preventChanges)
            return;
        this._preventChanges = true;

        let index = path.get_indices()[0];
        let names = this._settings.get_strv(WORKSPACE_KEY);

        if (index >= names.length)
            return;

        names.splice(index, 1);

        // compact the array
        for (let i = names.length -1; i >= 0 && !names[i]; i++)
            names.pop();

        this._settings.set_strv(WORKSPACE_KEY, names);

        this._preventChanges = false;
    },
});

const WorkspaceSettingsWidget = new GObject.Class({
    Name: 'WorkspaceIndicator.WorkspaceSettingsWidget',
    GTypeName: 'WorkspaceSettingsWidget',
    Extends: Gtk.Grid,

    _init: function(params) {
        this.parent(params);
        this.margin = 12;
        this.orientation = Gtk.Orientation.VERTICAL;

        this.add(new Gtk.Label({ label: '<b>' + _("Workspace Names") + '</b>',
                                 use_markup: true, margin_bottom: 6,
                                 hexpand: true, halign: Gtk.Align.START }));

        let scrolled = new Gtk.ScrolledWindow({ shadow_type: Gtk.ShadowType.IN });
        scrolled.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.add(scrolled);

        this._store = new WorkspaceNameModel();
        this._treeView = new Gtk.TreeView({ model: this._store,
                                            headers_visible: false,
                                            reorderable: true,
                                            hexpand: true,
                                            vexpand: true
                                          });

        let column = new Gtk.TreeViewColumn({ title: _("Name") });
        let renderer = new Gtk.CellRendererText({ editable: true });
        renderer.connect('edited', Lang.bind(this, this._cellEdited));
        column.pack_start(renderer, true);
        column.add_attribute(renderer, 'text', this._store.Columns.LABEL);
        this._treeView.append_column(column);

        scrolled.add(this._treeView);

        let toolbar = new Gtk.Toolbar({ icon_size: Gtk.IconSize.SMALL_TOOLBAR });
        toolbar.get_style_context().add_class(Gtk.STYLE_CLASS_INLINE_TOOLBAR);

        let newButton = new Gtk.ToolButton({ icon_name: 'list-add-symbolic' });
        newButton.connect('clicked', Lang.bind(this, this._newClicked));
        toolbar.add(newButton);

        let delButton = new Gtk.ToolButton({ icon_name: 'list-remove-symbolic' });
        delButton.connect('clicked', Lang.bind(this, this._delClicked));
        toolbar.add(delButton);

        let selection = this._treeView.get_selection();
        selection.connect('changed',
            function() {
                delButton.sensitive = selection.count_selected_rows() > 0;
            });
        delButton.sensitive = selection.count_selected_rows() > 0;

        this.add(toolbar);
    },

    _cellEdited: function(renderer, path, new_text) {
        let [ok, iter] = this._store.get_iter_from_string(path);

        if (ok)
            this._store.set(iter, [this._store.Columns.LABEL], [new_text]);
    },

    _newClicked: function() {
        let iter = this._store.append();
        let index = this._store.get_path(iter).get_indices()[0];

        let label = _("Workspace %d").format(index + 1);
        this._store.set(iter, [this._store.Columns.LABEL], [label]);
    },

    _delClicked: function() {
        let [any, model, iter] = this._treeView.get_selection().get_selected();

        if (any)
            this._store.remove(iter);
    }
});

function init() {
    Convenience.initTranslations();
}

function buildPrefsWidget() {
    let widget = new WorkspaceSettingsWidget();
    widget.show_all();

    return widget;
}

*/
