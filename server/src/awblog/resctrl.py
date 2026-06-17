import os
import json
from pathlib import Path

class ResCtrl:
    """ resource control """
    def __init__(self):
        """ constructor """
        self.load_mapping()


    def load_mapping(self):
        """ load mapping """
        docroot = os.environ['DOCUMENT_ROOT']
        entry_to_real_file_map = {}
        if docroot:
            idx_entries_json = Path(docroot) / 'index-entries.json' 
            with open(idx_entries_json) as fp:
                idx_entries = json.load(fp)
                for key in idx_entries:
                    for file in idx_entries[key]:
                        entry_to_real_file_map[file] = key

        self.entry_to_real_file_map = entry_to_real_file_map


    def get_resource(self, entry):
        """ get resource name """
        result = None
        if entry in self.entry_to_real_file_map:
            result = self.entry_to_real_file_map[entry]
        return result
# vi: se ts=4 sw=4 et:
