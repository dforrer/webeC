<?php
/**
 * Copyright Daniel Forrer 2014
 */

$str_json = file_get_contents('php://input');

$con = mysqli_connect('localhost', 'root', 'y9asCPTE', 'item_manager');
if (!$con) {
	die('Could not connect: ' . mysqli_error($con));
}

mysqli_select_db($con, "item_manager");
$sql = "SELECT token FROM user WHERE id = '" . $q . "'";
$result = mysqli_query($con, $sql);


while ($row = mysqli_fetch_array($result)) {
	echo "{";
	echo "<td>" . $row['FirstName'] . "</td>";
	echo "<td>" . $row['LastName'] . "</td>";
	echo "<td>" . $row['Age'] . "</td>";
	echo "<td>" . $row['Hometown'] . "</td>";
	echo "<td>" . $row['Job'] . "</td>";
	echo "</tr>";
}
echo "</table>";

mysqli_close($con);