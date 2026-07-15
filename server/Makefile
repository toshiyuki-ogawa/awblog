
i18n-src/awblog.pot:
	find src -name '*.py' | xgettext -L python --package-name=awblog \
		--package-version=0.0.1 \
		--msgid-bugs-address=toshiyuki.ogawa.2.71@gmail.com \
		--copyright-holder='Toshiyuki Ogawa' -f - -o $@

.PHONY: i18n-src/awblog.pot

awblog-pot: i18n-src/awblog.pot

.PHONY: awblog-pot

# vi: se ts=4 sw=4 noet:
