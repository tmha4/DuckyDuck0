<?php
require_once('getdata.php');
$query = "select * from upvote";
$result = mysqli_query($conn, $query)
?>


<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote</title>
    <link rel="icon" type="image/png" href="../img/love-birds.png">
    <link rel="stylesheet" href="Vstyle.css">
    <link rel="stylesheet" href="style.css"> 
    <script src="http://localhost:8080/socket.io/socket.io.js"></script>    
<!--table things-->
<!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="fonts/icomoon/style.css">

    <link rel="stylesheet" href="css/owl.carousel.min.css">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    
    <!-- Style -->
    <link rel="stylesheet" href="Vstyle.css">

</head>

<body>

      <nav>
<a href="../index.html"><img src="../img/road.png"></a>
<div class="nav-links" id="navLinks">
    <ul>
        <li><a href="index.html" class="home-item">HOME</a></li>
    </ul>
</div>
</nav>
    <div class="yu">
    <div class="container">
        <h2> Vote for the duck!🪿</h2>
        <div class="progress-box" id="yes" onclick="yes(0)">
            <p>Yes </p>
            <div class="progress-bar">
                <span data="0%" class="percent-tag"></span>
            </div>
        </div>
        <form action="../nodeServer/index.js" class="FormBlank" id="yesForm" method="post" style="display: none;">
            <input 
            type="number" min="0" max="100"
            class="inputField" name="value" 
            placeholder="النسبة من %"  >
                <input class="inputmm" type="submit"/> 
        
        </form>
        
        <div class="progress-box" id="no">
            <p>No</p>
            <div class="progress-bar">
                <span data="0%" class="percent-tag"></span>
            </div>
        </div>
        <p id="responseMessage"></p>
        <h3>Total Votes : <span id="totalVotes"></span></h3>
    </div>
    <script defer src="routes/script.js"></script> <!--تغيير-->
    
<!--Table -->
<div class="content">
    <div class="containerT">      
      <div class="table-responsive">
<table class="table table-striped custom-table">
<thead>
    <tr>
        <th scope="col">id</th>
        <th scope="col">votingPolls</th>
        <th scope="col">percentage</th>
        <th scope="col">time</th>
        <th scope="col">date</th>
        <th scope="col">totalVotes</th>
    </tr>
    <tr>
        <?php
        while($row = mysqli_fetch_assoc($result))
        {
            ?>
            <td><?php echo $row['id']; ?></td>
            <td><?php echo $row['votingPolls']; ?></td>
            <td><?php echo $row['percentage']; ?></td>
            <td><?php echo $row['time']; ?></td>
            <td><?php echo $row['date']; ?></td>
            <td><?php echo $row['totalVotes']; ?></td>


            </tr>
            <?php
        }

        ?>
</thead>
<tbody id="upvoteTable">

</tbody>
</table>


    </div>

  </div>
</div>
    
    <script src="js/jquery-3.3.1.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/main.js"></script>
</table>
<!-- PHP CODE FOR TABLE / FETCH DATA FROM DB -->

</body>
</html>
