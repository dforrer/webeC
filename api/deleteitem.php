<?php

/**
 * Copyright Daniel Forrer 2014
 */

/**

Delete item for user:

POST
/deleteitem.php

BODY
{
	"username":"Daniel",
	"token":"53a03780311a5",
	"item_id":2
}

RESPONSE
{
	"item_id":2
}

*/

// Connect to mysql-database
//---------------------------
$con = mysqli_connect('localhost', 'root', 'y9asCPTE', 'item_manager');
if (!$con)
{
	die('Could not connect: ' . mysqli_error($con));
}

// Get POST-Data from request
//----------------------------
$str_json = file_get_contents('php://input');

// Parse JSON-Data
//-----------------
$json_parsed = json_decode($str_json);

$username = $json_parsed->{'username'};
$token = $json_parsed->{'token'};
$item_id = $json_parsed->{'item_id'};

if ($json_parsed == null
	|| $username == null
	|| $token == null
	|| $item_id == null )
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Execute MySQL-Query
//---------------------
$sql = "SELECT * FROM users WHERE username = '" . $username . "'";

$result = mysqli_query($con, $sql);
if ($result == null)
{
	header('HTTP/1.0 401 Unauthorized');
	exit;
}

// Fetch first row in result set
//-------------------------------
$row = mysqli_fetch_array($result);
if ($row == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Verify user
//-------------
if ($row['token'] != $token)
{
	header('HTTP/1.0 401 Unauthorized');
	exit;
}

// Free result set
//-----------------
mysqli_free_result($result);

// Delete foreign keys from items_tags-table
//-------------------------------------------
$query = "DELETE FROM items_tags WHERE item_id = '". $item_id ."'";

$result = mysqli_query($con, $query);
if ($result == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Echo item_id as JSON
//----------------------
echo "{\"item_id\":";
echo $item_id;
echo "}";

// Free result set
//-----------------
mysqli_free_result($result);


// Delete item from items-table
//------------------------------
$query = "DELETE FROM items WHERE item_id = '". $item_id ."'";

$result = mysqli_query($con, $query);
if ($result == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Free result set
//-----------------
mysqli_free_result($result);

mysqli_close($con);


exit;

/*
while ($row = mysqli_fetch_array($result)) {
	echo "{";
	echo "<td>" . $row['FirstName'] . "</td>";
	echo "<td>" . $row['LastName'] . "</td>";
	echo "<td>" . $row['Age'] . "</td>";
	echo "<td>" . $row['Hometown'] . "</td>";
	echo "<td>" . $row['Job'] . "</td>";
	echo "</tr>";
}
*/

