# Qubes Attachments

Qubes Attachments is a Thunderbird extension for
[Qubes OS](https://www.qubes-os.org) that adds Qubes actions to email
attachments. It lets you open an attachment in a DisposableVM, so an untrusted
file opens in a throwaway qube instead of the qube running Thunderbird, and copy
an attachment to another qube.

## Usage

The extension adds these actions in Thunderbird:

- **Open in DispVM** — open the selected attachment in a DisposableVM.
- **Send to VM** — copy the selected attachment to another qube.
- **Send all to VM** — copy every attachment on the message to another qube.

In the extension's options you can turn on **Open attachment in DispVM by
default**, so opening an attachment the normal way sends it to a DisposableVM.
