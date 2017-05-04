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

const Gio = imports.gi.Gio;
const SchemaSource = imports.gi.Gio.SettingsSchemaSource;

const ExtensionUtils = imports.misc.extensionUtils;

function getSettings (schema) {
    let schema = schema;
    if (schema == null) {
        let extension = ExtensionUtils.getCurrentExtension();
        schema = extension.metadata['settings-schema'];
    }

    let schemaDir = extension.dir.get_child('schema');
    if (!schemaDir.query_exists(null))
        throw new Error ("Schema directory " + schemaDir + " for " + extension.metadata.uuid + " not found.");

    let schemaSrc = SchemaSource.new_from_directory(schemaDir.get_path(),
                                                    SchemaSource.get_default(),
                                                    false);

    let schemaObj = schemaSrc.lookup(schema, true);
    if (!schemaObj)
        throw new Error ("Schema " + schemaDir + " for " + extension.metadata.uuid + " not found.");

    return new Gio.Settings({ settings_schema: schemaObj });
}
