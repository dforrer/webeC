<?php

/**
 * Copyright Daniel Forrer 2014
 */


/**
Get items for user:
--------------------
POST
/getitems.php

BODY
{
	"username":"Daniel",
	"token":"53a03780311a5"
}

RESPONSE
{
	"items":
 	[
		{
			"item_id":5,
			"title":"Mein neues Item",
			"prio":3,
			"tags":"Einkaufen Geschenke Weihnachten",
			"description":"Beschreibung",
			"creation_date":"2000-01-01 00:00:00",
			"is_read":1
		},
		{
			"item_id":6,
			"title":"Ein ganz anderes item",
			"prio":3,
			"tags":"Einkaufen Geschenke Weihnachten",
			"description":"Beschreibung",
			"creation_date":"2000-01-01 00:00:00",
			"is_read":0
		}
	]
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

if ($json_parsed == null
	|| $username == null
	|| $token == null )
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


// Fetch items
//-------------
$sql = "SELECT item_id, title, description, prio, creation_date, is_read
FROM items WHERE user_id = '" . $row['user_id'] . "'";

$result = mysqli_query($con, $sql);
if ($result == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}


echo "{\"items\":[";

// Iterate through result set
//----------------------------
$isFirst = true;
while ($row = mysqli_fetch_array($result))
{
	if ($isFirst == true)
	{
		$isFirst = false;
	}
	else
	{
		echo ",";
	}

	// Echo as JSON-String
	//---------------------
	echo "{";
	echo "\"item_id\":";
	echo $row['item_id'] . ",";
	echo "\"title\":";
	echo "\"" . $row['title'] . "\",";
	echo "\"prio\":";
	echo $row['prio'] . ",";
	echo "\"description\":";
	echo "\"" . $row['description'] . "\",";

	echo "\"tags\":\"";

	// Load tags for every item
	//--------------------------
	$sql = "SELECT tag_id AS id,
	(SELECT name FROM tags WHERE tag_id = id) AS tag_name
	FROM items_tags WHERE item_id = '". $row['item_id'] ."'";

	$result2 = mysqli_query($con, $sql);
	if ($result2 == null)
	{
		header('HTTP/1.0 400 Bad Request');
		exit;
	}

	$isFirst2 = true;
	while ($row2 = mysqli_fetch_array($result2))
	{
		if ($isFirst2 == true)
		{
			$isFirst2 = false;
		}
		else
		{
			echo " ";
		}
		echo $row2['tag_name'];
	}

	// Free result set
	//-----------------
	mysqli_free_result($result2);

	echo "\",";
	echo "\"creation_date\":";
	echo "\"" . $row['creation_date'] . "\",";
	echo "\"is_read\":";
	echo $row['is_read'];

	echo "}";
}
echo "]}";

// Free result set
//-----------------
mysqli_free_result($result);

mysqli_close($con);


exit;



