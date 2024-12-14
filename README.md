# Hintable Tabs for Tridactyl

Display currently open tabs and use Tridactyl's hinting to select and switch to one.

Copy and paste the entirety of [hinttabs](hinttabs) into the Tridactyl command line to define a command, `hinttabs`

`:hinttabs` will show tabs in the current window and hint them to select one.
`:hinttabs -a` will show tabs from all windows.

`hinttabs` can be bound like any other Tridactyl command using `:bind hinttabs [key(s)]`

The tabs will be displayed in an iframe on the page. The current Tridactyl theme will be copied into the iframe to attempt to keep the styling consistent.

## Screenshots with various themes

<img width="1325" alt="Screenshot 2024-12-14 at 17 47 04" src="https://github.com/user-attachments/assets/ea87454c-ec9a-4d65-89f3-429881530563" />
<img width="1325" alt="Screenshot 2024-12-14 at 17 47 24" src="https://github.com/user-attachments/assets/930b6f93-9f36-496b-8579-cadab2bda9c5" />
<img width="1325" alt="Screenshot 2024-12-14 at 17 48 09" src="https://github.com/user-attachments/assets/d2488605-58f7-4ff8-8853-4fbd64accca8" />
