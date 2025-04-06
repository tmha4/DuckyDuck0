<?php
$conn = mysqli_connect('localhost', 'root', '', 'vote');if (!$conn) {
    die("Connection failed: " .mysqli_connect_error());
}
?>