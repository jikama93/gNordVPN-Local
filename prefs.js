const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain('gnordvpn-local').gettext;

var Fields = {
   TOPBAR_DISPLAY_MODE_ID: 'vpn-indicator',
};

const SCHEMA_NAME = 'org.gnome.shell.extensions.gnordvpn-local';

const getSchema = function () {
    let schemaDir = Extension.dir.get_child('schemas').get_path();
    let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir, Gio.SettingsSchemaSource.get_default(), false);
    let schema = schemaSource.lookup(SCHEMA_NAME, false);

    return new Gio.Settings({ settings_schema: schema });
};

var SettingsSchema = getSchema();

function init() {
    let localeDir = Extension.dir.get_child('locale');
    if (localeDir.query_exists(null))
        Gettext.bindtextdomain('gnordvpn-local', localeDir.get_path());
}

const App = new Lang.Class({
    Name: 'gNordVpnLocal.App',
    _init: function() {
        this.main = new Gtk.Grid({
            margin: 10,
            row_spacing: 12,
            column_spacing: 18,
            column_homogeneous: false,
            row_homogeneous: false
        });
        this.field_display_mode = new Gtk.ComboBox({
            model: this._create_display_mode_options()});

        let rendererText = new Gtk.CellRendererText();
        this.field_display_mode.pack_start (rendererText, false);
        this.field_display_mode.add_attribute (rendererText, "text", 0);

        let displayModeLabel  = new Gtk.Label({
            label: _("What to show in top bar"),
            hexpand: true,
            halign: Gtk.Align.START
        });

        const addRow = ((main) => {
            let row = 0;
            return (label, input) => {
                let inputWidget = input;

                if (input instanceof Gtk.Switch) {
                    inputWidget = new Gtk.HBox();
                    inputWidget.pack_end(input, false, false, 0);
                }

                if (label) {
                    main.attach(label, 0, row, 1, 1);
                    main.attach(inputWidget, 1, row, 1, 1);
                }
                else {
                    main.attach(inputWidget, 0, row, 2, 1);
                }

                row++;
            };
        })(this.main);

        addRow(displayModeLabel,    this.field_display_mode);

        SettingsSchema.bind(Fields.TOPBAR_DISPLAY_MODE_ID, this.field_display_mode, 'active', Gio.SettingsBindFlags.DEFAULT);

        this.main.show_all();
    },
    _create_display_mode_options : function(){
        let options = [
            { name: _("Icon") },
            { name: _("VPN") },
            { name: _("Verbose"),},
        ];
        let liststore = new Gtk.ListStore();
        liststore.set_column_types([GObject.TYPE_STRING])
        for (let i = 0; i < options.length; i++ ) {
            let option = options[i];
            let iter = liststore.append();
            liststore.set (iter, [0], [option.name]);
        }
        return liststore;
    }
});

function buildPrefsWidget(){
    let widget = new App();
    return widget.main;
}
