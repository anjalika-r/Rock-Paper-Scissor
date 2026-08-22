def getHandSign(hand_points):
    points=hand_points.points
    # Check if index, middle, ring, and pinky are curled (MCP y < Tip y)
    fingers_curled = all([points[i].y < points[i+3].y for i in range(5, 18, 4)])
    if fingers_curled:
        if points[4].y < points[3].y and points[4].y < points[5].y:
            return "thumbs-up"
        return "rock"
    elif all([points[i].y<points[i+3].y for i in range(13,18,4)]):
        return "scissors"
    elif all([points[i].y>points[i+3].y for i in range(5,18,4)]):
        return "paper"