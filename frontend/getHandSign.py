def getHandSign(hand_points):
    points=hand_points.points
    if all([points[i].y<points[i+3].y for i in range(5,18,4)]):
        return "rock"
    elif all([points[i].y<points[i+3].y for i in range(13,18,4)]):
        return "scissors"
    elif all([points[i].y>points[i+3].y for i in range(5,18,4)]):
        return "paper"