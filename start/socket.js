const Ws = use('Ws')

Ws.channel('game:*', 'GameManagerController')
