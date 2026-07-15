
update-dist:
	npm run html-dist

.PHONY: update-dist


lint:
	npm run tsc-check

.PHONY: lint

index-entries-json: 
	npm run make-index-map >index-entries.json

.PHONY: index-entries-json


i18n-src/awblog.pot:
	sh tools/i18n-tool.sh >$@

.PHONY: i18n-src/awblog.pot

awblog-pot: i18n-src/awblog.pot

.PHONY: awblog-pot


awblog-msg-json:
	npm run gen-i18n


.PHONY: awblog-msg-json

# vi: se ts=4 sw=4 noet:
