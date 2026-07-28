
update-dist:
	npm run html-dist

.PHONY: update-dist


lint:
	npm run tsc-check

.PHONY: lint

index-entries-json: 
	npm run make-index-map

.PHONY: index-entries-json


index-entries-map-txt: 
	npm run make-index-map-txt

.PHONY: index-entries-txt



i18n-src/awblog-0.pot:
	sh tools/i18n-tool.sh >$@

awblog-0-pot: i18n-src/awblog-0.pot

.PHONY: awblog-0-pot



i18n-build/ja/awblog.po : $(wildcard i18n-src/ja/awblog-*.po)
	mkdir  -p $(@D)
	msgcat -o $@ $^


awblog-msg-json: i18n-build/ja/awblog.po 
	npm run gen-i18n

.PHONY: awblog-msg-json


# vi: se ts=4 sw=4 noet:
