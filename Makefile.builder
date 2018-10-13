ifeq ($(PACKAGE_SET),vm)
  DEBIAN_BUILD_DIRS := debian
  RPM_SPEC_FILES := rpm_spec/thunderbird-qubes.spec
endif

# vim: filetype=make
