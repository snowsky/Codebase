Parties = new Mongo.Collection("parties");

if (Meteor.isClient) {
    angular
        .module('socially', ['angular-meteor']);

    angular
        .module('socially').controller('PartiesListCtrl', [ '$scope', '$meteor',
            function($scope, $meteor) {
        // before go to Mongo
//                $scope.parties = [
//                    {
//                        'name': 'Dubstep-Free Zone',
//                        'description': 'Can we please just for an evening not listen to dubstep.'
//                    },
//                    {
//                        'name': 'All dubstep all the time',
//                        'description': 'Get it on!'
//                    },
//                    {
//                        'name': 'Savage lounging',
//                        'description': 'Leisure suit required. And only fiercest manners.'
//                    }
//                ];
                $scope.parties = $meteor.collection(Parties);
                $scope.remove = function(party) {
                    $scope.parties.splice( $scope.parties.indexOf(party), 1 );
                };
            } ]);
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Parties.find().count() === 0) {

            var parties = [
                {'name': 'Dubstep-Free Zone',
                'description': 'Can we please just for an evening not listen to dubstep.'},
                {'name': 'All dubstep all the time',
                  'description': 'Get it on!'},
                {'name': 'Savage lounging',
                  'description': 'Leisure suit required. And only fiercest manners.'}
            ];

            for (var i = 0; i < parties.length; i++)
                Parties.insert(parties[i]);

        }
    });
}
