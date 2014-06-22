<?php

/**
 * Copyright Daniel Forrer 2014
 */


/**
Check if a user account exists/create account if it doesn't exist:

POST
/gettoken.php

BODY
{
	"username":"Daniel",
	"secret":"kleine welt"	(entered by user on demand)
}

RESPONSE (example - success)
{
	"token":"53a03780311a5"
}

RESPONSE (example - failure)
{
	"token":null
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
$secret = $json_parsed->{'secret'};

if ($json_parsed == null || $username == null || $secret == null)
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
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Fetch first row in result set
//-------------------------------
$row = mysqli_fetch_array($result);
if ($row == null)
{
	// Date in 2 weeks
	//-----------------
	$dateInTwoWeeks = date('Y-m-d H:i:s', strtotime('+2 weeks'));

	// Create token
	//--------------
	$token = uniqid();

	// username doesn't exist => create new user
	//-------------------------------------------
	$query = "INSERT INTO users (username, secret, token, expiration_date) VALUES ('". $username ."','". $secret ."','". $token ."','". $dateInTwoWeeks ."')";

	$rv = mysqli_query($con, $query);
	if ($rv == null)
	{
		header('HTTP/1.0 400 Bad Request');
		exit;
	}
	// Free result set
	//-----------------
	mysqli_free_result($rv);

	// Echo token as JSON
	//--------------------
	echo "{\"token\":\"";
	echo $token;
	echo "\"}";
}
else
{
	if ($row['secret'] == $secret)
	{
		// Valid login data provided
		//---------------------------
		echo "{\"token\":\"";
		echo $row['token'];
		echo "\"}";
	}
	else
	{
		// Login data does NOT match
		//---------------------------
		echo "{\"token\":";
		echo "null";
		echo "}";
	}
}
// Free result set
//-----------------
mysqli_free_result($result);

mysqli_close($con);


exit;

