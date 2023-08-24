{ pkgs ? import <nixpkgs> {} }:

with pkgs; mkShell {
    buildInputs = [
        nodejs-18_x
        yarn
    ];
}